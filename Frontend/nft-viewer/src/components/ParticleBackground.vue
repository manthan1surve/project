<template>
  <!-- Background canvas covering full screen, positioned behind all content -->
  <canvas 
    ref="canvasRef" 
    class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-black"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineExpose } from 'vue';

// --- State Management ---
const canvasRef = ref(null);
let ctx = null;
let animationFrameId = null;
let particles = [];
const mouse = { x: null, y: null, radius: 150 };
const trails = ref([]); // Cursor Singularity

// Animation States
const isBuilding = ref(false);
const buildStartTime = ref(0);
const currentShape = ref('none');

// --- Configuration ---
const VISUAL_CONFIG = {
  easing: 0.005, // Cinematic Slow Build (10s target)
  builderRatio: 0.8, // 80% builders, 20% strays
  parallaxStrength: 0.005, // VERY SLOW depth effect (was 0.05)
  trailLength: 20, // Length of cursor tail
};

// --- GEOMETRY ENGINE (DOM Scanning) ---
let pooledTargets = []; // Flattened list of all target points {x, y}
let scanInterval = null;

// Helper: Generate points uniformly along the perimeter using exact step size
const generatePerimeterPoints = (rect, pointCount) => {
  const points = [];
  const { x, y, width: w, height: h } = rect;
  
  if (pointCount < 1) return points;
  
  // Exact step to fit 'pointCount' points along 'perimeter'
  const perimeter = 2 * (w + h);
  const step = perimeter / pointCount;
  
  // Perimeter Walker
  for (let i = 0; i < pointCount; i++) {
    let d = i * step; // Distance traveled
    let px, py;
    
    // Map linear distance 'd' to rectangular perimeter
    if (d < w) {
      // Top Edge
      px = x + d;
      py = y;
    } else if (d < w + h) {
      // Right Edge
      px = x + w;
      py = y + (d - w);
    } else if (d < 2 * w + h) {
      // Bottom Edge
      px = x + w - (d - (w + h));
      py = y + h;
    } else {
      // Left Edge
      px = x;
      py = y + h - (d - (2 * w + h));
    }
    
    points.push({ x: px, y: py });
  }
  
  return points;
};

// Helper: Check if point is inside any exclusion rect
const isexcluded = (x, y, exclusions) => {
  for (let ex of exclusions) {
    if (x >= ex.left && x <= ex.right && y >= ex.top && y <= ex.bottom) {
      return true;
    }
  }
  return false;
};

// Helper: Generate points cleanly INSIDE the area (Volumetric Fill - Structured)
const generateAreaPoints = (rect, pointCount, exclusions = []) => {
  const points = [];
  const { x, y, width: w, height: h } = rect;
  
  if (pointCount < 1) return points;
  
  // Grid approach for even, ORDERED distribution (Obedient Mesh)
  const cols = Math.ceil(Math.sqrt(pointCount * (w/h)));
  const rows = Math.ceil(pointCount / cols);
  
  const stepX = w / cols;
  const stepY = h / rows;
  
  for (let r = 0; r <= rows; r++) { 
    for (let c = 0; c <= cols; c++) { 
       // STRICT ALIGNMENT (No Jitter)
       const px = x + (c / cols) * w;
       const py = y + (r / rows) * h;
       
       // SKIP if this point falls inside an input box (Exclusion Zone)
       if (!isexcluded(px, py, exclusions)) {
          points.push({ x: px, y: py });
       }
    }
  }
  
  return points;
};

// SCANNER: Find elements, calculate Density, and allocate targets
const scanDomTargets = () => {
  const elements = [
    // Main Frames (Heavier weight)
    ...document.querySelectorAll('.glass-card'),
    ...document.querySelectorAll('[data-particle-target="frame"]'),
    
    // Internal Detail - REMOVED INPUTS to keep them clear
    ...document.querySelectorAll('button'),
    ...document.querySelectorAll('.btn-primary')
  ];
  
  // Identify Exclusion Zones (Inputs)
  const exclusionElements = document.querySelectorAll('input');
  const exclusions = [];
  exclusionElements.forEach(el => {
    const r = el.getBoundingClientRect();
    // Pad slightly to ensure clearance
    exclusions.push({ left: r.left + 5, right: r.right - 5, top: r.top + 5, bottom: r.bottom - 5 });
  });
  
  const uniqueElements = [...new Set(elements)];

  if (uniqueElements.length > 0) {
     // 1. Calculate Total Area
     let totalArea = 0;
     const validElements = [];
     
     uniqueElements.forEach(el => {
       const rect = el.getBoundingClientRect();
       if (rect.width > 0 && rect.height > 0) {
         const area = rect.width * rect.height;
         const weight = rect.width > 300 ? 1.0 : 0.6;
         validElements.push({ el, rect, area, weight });
         totalArea += area * weight;
       }
     });
     
     if (totalArea === 0) return false;

     // 2. Calculate Particles Per Pixel (Area based)
     const builderCount = particles.filter(p => p.role !== 'stray').length;
     const pp_area = builderCount / totalArea;
     
     // 3. Generate Dual-Layer Points (Volumetric + Hard Edge)
     let newPoints = [];
     validElements.forEach(item => {
        // A. Volumetric Fill (Structured Grid)
        let areaCount = Math.floor(item.area * item.weight * pp_area);
        if (areaCount < 10) areaCount = 10;
        // PASS EXCLUSIONS HERE
        newPoints.push(...generateAreaPoints(item.rect, areaCount, exclusions));
        
        // B. Hard Edge (Perimeter Trace)
        // High density: 1 particle every 1 pixel -> Solid Line feel
        const perimeterLength = 2 * (item.rect.width + item.rect.height);
        const perimeterCount = Math.floor(perimeterLength / 1); 
        
        // Note: We do NOT exclude perimeter points, we want the card border to be complete
        newPoints.push(...generatePerimeterPoints(item.rect, perimeterCount));
     });
     
     // 4. Sort by Y for Top-Down Scan
     newPoints.sort((a, b) => a.y - b.y);
     
     pooledTargets = newPoints;
     return true;
  }
  return false;
};

// ... existing geometry code ...
// --- PARTICLE LOGIC ---
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.role = Math.random() < VISUAL_CONFIG.builderRatio ? 'builder' : 'stray';
    
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    
    this.size = Math.random() * 0.5 + 1.5;
    this.baseVx = (Math.random() - 0.5) * 0.4;
    this.baseVy = (Math.random() - 0.5) * 0.4;
    this.vx = this.baseVx;
    this.vy = this.baseVy;
    
    this.anchorX = null;
    this.anchorY = null;
    this.isLocked = false;
    
    // GLITCH FX
    this.glitchFrames = 0;
    this.glitchX = 0;
    this.glitchY = 0;
  }

  assignTarget(index, totalBuilders) {
    if (this.role === 'stray') return;
    
    if (pooledTargets.length > 0) {
      // Linear assignment for uniform coverage
      const targetIndex = Math.floor((index / totalBuilders) * pooledTargets.length);
      const pt = pooledTargets[targetIndex % pooledTargets.length];
      
      this.targetX = pt.x;
      this.targetY = pt.y;
      this.anchorX = pt.x; // Use anchor for elasticity
      this.anchorY = pt.y; 
      this.isLocked = false; 
    } else {
      this.targetX = this.canvas.width / 2;
      this.targetY = this.canvas.height / 2;
    }
  }

  update() {
    // --- BUILDER LOGIC ---
    if (isBuilding.value && this.role !== 'stray' && this.targetX !== null) {
      
      // PERMANENT LOCK (Elastic Mode + Glitch)
      if (this.isLocked) {
        
        // GLITCH TRIGGER (0.05% chance)
        if (this.glitchFrames === 0 && Math.random() < 0.0005) {
           this.glitchFrames = Math.floor(Math.random() * 5) + 3; // 3-8 frames
           this.glitchX = (Math.random() - 0.5) * 6; // Jitter +/- 3px
           this.glitchY = (Math.random() - 0.5) * 6;
        }

        // Calculate elastic offset from anchor
        let tx = this.anchorX;
        let ty = this.anchorY;

        // MOUSE MAGNETISM
        if (mouse.x && mouse.y) {
           const dx = mouse.x - tx;
           const dy = mouse.y - ty;
           const dist = Math.sqrt(dx*dx + dy*dy);
           
           if (dist < 120) {
              const force = (120 - dist) / 120;
              // Attract slightly towards mouse (Bulge effect)
              tx += dx * force * 0.3; 
              ty += dy * force * 0.3;
           }
        }
        
        // Update Spring Physics
        this.x += (tx - this.x) * 0.1;
        this.y += (ty - this.y) * 0.1;

        // Apply Glitch Offset (Visual only, doesn't affect physics target)
        if (this.glitchFrames > 0) {
          this.x += this.glitchX;
          this.y += this.glitchY;
          this.glitchFrames--;
        }
        
        return;
      }
      
      // LASER SCAN LOGIC
      const elapsed = Date.now() - buildStartTime.value;
      let shouldMove = false;
      
      if (elapsed > 2000 && elapsed < 9000) {
         const scanProgress = (elapsed - 2000) / 7000;
         const scanY = scanProgress * this.canvas.height;
         if (this.targetY < scanY + 100) shouldMove = true;
      } else if (elapsed >= 9000) {
         shouldMove = true; 
      }
      
      if (shouldMove) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 1) {
           this.isLocked = true;
           this.x = this.targetX;
           this.y = this.targetY;
        } else {
           this.x += dx * VISUAL_CONFIG.easing;
           this.y += dy * VISUAL_CONFIG.easing;
        }
      } else {
        // Drift while waiting
        this.x += this.vx * 0.5;
        this.y += this.vy * 0.5;
      }

    } 
    // --- STRAY LOGIC (Background) ---
    else {
      // Parallax Shift (Opposite to Mouse)
      let paraX = 0;
      let paraY = 0;
      if (mouse.x && mouse.y) {
         const centerX = this.canvas.width / 2;
         const centerY = this.canvas.height / 2;
         paraX = (mouse.x - centerX) * -VISUAL_CONFIG.parallaxStrength * 0.1;
         paraY = (mouse.y - centerY) * -VISUAL_CONFIG.parallaxStrength * 0.1;
      }

      // Move
      this.x += this.vx + paraX;
      this.y += this.vy + paraY;

      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
           const force = (150 - dist) / 150;
           // Gentle repulsion for strays to clear the path
           this.vx -= (dx/dist) * force * 0.5;
           this.vy -= (dy/dist) * force * 0.5;
        }
      }
      
      // Dampening
      const damp = 0.95;
      this.vx = this.vx * damp + this.baseVx * 0.05;
      this.vy = this.vy * damp + this.baseVy * 0.05;

      if (this.x > this.canvas.width) this.x = 0;
      else if (this.x < 0) this.x = this.canvas.width;
      if (this.y > this.canvas.height) this.y = 0;
      else if (this.y < 0) this.y = this.canvas.height;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    
    if (isBuilding.value && this.role !== 'stray') {
       if (this.isLocked) {
          // GLITCH COLOR
          if (this.glitchFrames > 0) {
             // Random Tech Colors: Magenta or Green or White
             const r = Math.random();
             if (r < 0.33) ctx.fillStyle = '#ff00ff'; // Magenta
             else if (r < 0.66) ctx.fillStyle = '#00ff00'; // Matrix Green
             else ctx.fillStyle = '#ffffff'; // White flash
          } else {
             // GRADIENT MAPPING (Vivid Purple -> Neon Cyan)
             const n = this.x / this.canvas.width;
             
             if (n < 0.5) {
                // VIVID PURPLE (Left)
                // R: 160->200, G: 0->100, B: 255
                ctx.fillStyle = `rgba(${160 + (n*80)}, ${n*200}, 255, 1.0)`;
             } else {
                // VIVID CYAN (Right)
                // R: 0->50, G: 200->255, B: 255
                ctx.fillStyle = `rgba(0, ${255}, 255, 1.0)`;
             }
          }
       } else {
          // Dimmer while moving
          ctx.fillStyle = `rgba(130, 200, 255, 0.4)`;
       }
    } else {
      ctx.fillStyle = `rgba(100, 108, 255, 0.3)`;
    }
    
    ctx.fill();
  }
}

// --- SYSTEM LOOP ---
const initParticles = () => {
  particles = [];
  const count = (canvasRef.value.width * canvasRef.value.height) / 1500; // ULTRA DENSITY (2.6x more particles)
  for (let i = 0; i < count; i++) particles.push(new Particle(canvasRef.value));
};

const packets = []; // Stores active data packets {p1, p2, t, speed}

const updateAndDrawPackets = () => {
  // Filter out finished packets (t >= 1)
  // We use filter inplace or reassign. Reassign is easier.
  let activePackets = [];
  
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#00ffff'; // Cyan glow
  
  for (let i = 0; i < packets.length; i++) {
    const pkt = packets[i];
    pkt.t += pkt.speed;
    
    if (pkt.t < 1) {
       activePackets.push(pkt);
       
       // Lerp position
       const cx = pkt.p1.x + (pkt.p2.x - pkt.p1.x) * pkt.t;
       const cy = pkt.p1.y + (pkt.p2.y - pkt.p1.y) * pkt.t;
       
       ctx.beginPath();
       ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
       ctx.fill();
    }
  }
  
  packets.length = 0;
  packets.push(...activePackets);
  
  ctx.shadowBlur = 0; // Reset
};

const drawConnections = () => {
  // Only connect locked particles (The Skelton Frame) or nearby drifters
  const threshold = isBuilding.value ? 60 : 90; 
  const lineOpacity = isBuilding.value ? 0.2 : 0.05; 
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      
      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) continue;
      
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < threshold) {
         ctx.beginPath();
         // If both locked, this is a structural beam
         if (p1.isLocked && p2.isLocked) {
            ctx.strokeStyle = `rgba(130, 200, 255, 0.4)`; // Stronger beam
            ctx.lineWidth = 0.8;
            
            // SPAWN PACKET (Living Circuitry)
            // 0.1% chance per frame per connection to spawn a data packet
            if (Math.random() < 0.001) {
               packets.push({ 
                 p1, 
                 p2, 
                 t: 0, 
                 speed: 0.01 + Math.random() * 0.03 // Random speed
               });
            }

         } else {
            ctx.strokeStyle = `rgba(130, 200, 255, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
         }
         ctx.moveTo(p1.x, p1.y);
         ctx.lineTo(p2.x, p2.y);
         ctx.stroke();
      }
    }
  }
};

// --- CURSOR SINGULARITY (Smooth Comet Trail) ---
const updateAndDrawTrails = () => {
    if (trails.value.length < 3) return;

    // 1. Decay existing
    for (let i = trails.value.length - 1; i >= 0; i--) {
        const pt = trails.value[i];
        pt.life -= 0.05;
        if (pt.life <= 0) {
            trails.value.splice(i, 1);
        }
    }
    
    // 2. Draw Smooth Curve (Quadratic Bezier)
    if (trails.value.length < 3) return;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(0, 255, 255, 0.6)`;
    ctx.lineWidth = 2.0;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Start at the tail (oldest point)
    let p0 = trails.value[0];
    ctx.moveTo(p0.x, p0.y);

    for (let i = 1; i < trails.value.length - 1; i++) {
        const p1 = trails.value[i];     // Current point (Control Point)
        const p2 = trails.value[i + 1]; // Next point
        
        // Curve to the midpoint between p1 and p2
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    
    // Connect to the very last point (Head)
    const last = trails.value[trails.value.length - 1];
    ctx.lineTo(last.x, last.y);
    
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
};

const animate = () => {
  if (!canvasRef.value) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // Draw Particles
  particles.forEach(p => { p.update(); p.draw(); });
  
  // Draw Lines & Spawn Packets
  drawConnections();
  
  // Draw Active Packets
  updateAndDrawPackets();
  
  // Draw Cursor Trails
  updateAndDrawTrails();
  
  animationFrameId = requestAnimationFrame(animate);
};

// --- EXPOSED API ---
const constructShape = (routePath) => {
  currentShape.value = routePath;
  isBuilding.value = true;
  buildStartTime.value = Date.now();
  
  pooledTargets = [];
  if (scanInterval) clearInterval(scanInterval);
  
  let attempts = 0;
  let builders = particles.filter(p => p.role !== 'stray');
  
  scanInterval = setInterval(() => {
    attempts++;
    const found = scanDomTargets();
    if (found) {
      builders.forEach((p, index) => p.assignTarget(index, builders.length));
    }
    if (attempts > 40) clearInterval(scanInterval);
  }, 50);
  
  builders.forEach((p, index) => p.assignTarget(index, builders.length));
};

const releaseBuild = () => {
  isBuilding.value = false;
};

defineExpose({ constructShape, releaseBuild });

// --- LIFECYCLE ---
const handleResize = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
    initParticles();
  }
};
const handleMouseMove = (e) => { 
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
    
    // Add Trail Point
    trails.value.push({
        x: e.clientX,
        y: e.clientY,
        size: 2 + Math.random() * 2,
        life: 1.0
    });
    
    // Limit trail length
    if (trails.value.length > 50) trails.value.shift();
};

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  handleResize();
  animate();
  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
});
onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
canvas {
  /* Prevent interaction blockers */
  pointer-events: none;
}
</style>
