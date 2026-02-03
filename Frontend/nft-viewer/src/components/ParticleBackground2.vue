<template>
  <canvas 
    ref="canvasRef" 
    class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none transition-colors duration-500"
    :class="isDark ? 'bg-[#0d1117]' : 'bg-gray-50'"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { isDark } from '../services/theme';

const canvasRef = ref(null);
let ctx = null;
let animationFrameId = null;
let particles = [];
const mouse = { x: null, y: null };
const trails = ref([]); 

const VISUAL_CONFIG = {
  parallaxStrength: 0.005, 
};

// --- AMBIENT LIGHTS ---
const lights = [
  { x: 0, y: 0, vx: 0.8, vy: 0.5, radius: 0, colorStart: 'rgba(100, 0, 255, 0.15)', colorStop: 'rgba(0,0,0,0)' }, // Purple
  { x: 0, y: 0, vx: -0.6, vy: 0.7, radius: 0, colorStart: 'rgba(0, 255, 255, 0.12)', colorStop: 'rgba(0,0,0,0)' }  // Cyan
];

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    
    this.size = Math.random() * 0.5 + 1.5;
    this.baseVx = (Math.random() - 0.5) * 0.4;
    this.baseVy = (Math.random() - 0.5) * 0.4;
    this.vx = this.baseVx;
    this.vy = this.baseVy;

    // Shine Logic
    this.shine = 0;
    this.isShining = false;
    this.shineSpeed = 0.02;
  }

  update() {
    // Parallax Shift
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

    // Mouse Interaction (Repel/Attract)
    if (mouse.x && mouse.y) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // Zone 1: Repel (Close range)
      if (dist < 100) {
         const force = (100 - dist) / 100;
         this.vx -= (dx/dist) * force * 0.8; // Stronger repel
         this.vy -= (dy/dist) * force * 0.8;
      } 
      // Zone 2: Attract (Mid range) - subtle "magnetic" pull
      else if (dist < 200) {
         const force = (200 - dist) / 200;
         this.vx += (dx/dist) * force * 0.05; 
         this.vy += (dy/dist) * force * 0.05;
      }
    }
    
    // Dampening
    const damp = 0.95;
    this.vx = this.vx * damp + this.baseVx * 0.05;
    this.vy = this.vy * damp + this.baseVy * 0.05;

    // Wrap around
    if (this.x > this.canvas.width) this.x = 0;
    else if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    else if (this.y < 0) this.y = this.canvas.height;

    // Shine Update
    if (this.isShining) {
        this.shine += this.shineSpeed;
        if (this.shine >= 1) {
            this.shine = 1;
            this.shineSpeed = -0.05; // Fade out
        } else if (this.shine <= 0) {
            this.shine = 0;
            this.isShining = false;
        }
    } else {
        // Random chance to start shining (0.2% per frame)
        if (Math.random() < 0.002) {
            this.isShining = true;
            this.shineSpeed = 0.05; // Fast bright flash
        }
    }
  }

  draw() {
    ctx.beginPath();
    let currentSize = this.size;
    
    if (this.isShining) {
        // Shine color adapts to theme
        const shineColor = isDark.value ? '255, 255, 255' : '100, 100, 255';
        ctx.fillStyle = `rgba(${shineColor}, ${0.3 + this.shine * 0.7})`;
        currentSize = this.size * (1 + this.shine * 0.5);
        
        // Add glow when shining
        if (this.shine > 0.5) {
            ctx.shadowBlur = 10 * this.shine;
            ctx.shadowColor = isDark.value ? '#ffffff' : '#6366f1';
        } else {
            ctx.shadowBlur = 0;
        }
    } else {
        // Base color adapts to theme
        ctx.fillStyle = isDark.value 
            ? `rgba(100, 108, 255, 0.3)` // Dark Mode: Blue-ish particles
            : `rgba(99, 102, 241, 0.4)`; // Light Mode: Indigo particles (darker)
        ctx.shadowBlur = 0;
    }

    ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  }
}

const initParticles = () => {
  particles = [];
  const count = (canvasRef.value.width * canvasRef.value.height) / 5000; // Standard density
  for (let i = 0; i < count; i++) particles.push(new Particle(canvasRef.value));
  
  // Init Lights
  lights[0].x = Math.random() * canvasRef.value.width;
  lights[0].y = Math.random() * canvasRef.value.height;
  lights[0].radius = Math.max(canvasRef.value.width, canvasRef.value.height) * 0.6;
  
  lights[1].x = Math.random() * canvasRef.value.width;
  lights[1].y = Math.random() * canvasRef.value.height;
  lights[1].radius = Math.max(canvasRef.value.width, canvasRef.value.height) * 0.5;
};

// --- AMBIENT UPDATE ---
const updateAndDrawlights = () => {
   // Draw lights in both modes now, but adjust intensity
   lights.forEach((light, index) => {
      light.x += light.vx;
      light.y += light.vy;
      
      // Bounce
      if (light.x < 0 || light.x > canvasRef.value.width) light.vx *= -1;
      if (light.y < 0 || light.y > canvasRef.value.height) light.vy *= -1;
      
      // Dynamic colors based on theme
      let startColor, stopColor;
      
      if (isDark.value) {
          // Dark Mode: Original subtle glow
          startColor = index === 0 ? 'rgba(100, 0, 255, 0.15)' : 'rgba(0, 255, 255, 0.12)';
          stopColor = 'rgba(0,0,0,0)'; 
      } else {
          // Light Mode: Softer, slightly more visible on white (Indigo/Teal)
          startColor = index === 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(20, 184, 166, 0.08)';
          stopColor = 'rgba(255,255,255,0)';
      }

      const g = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
      g.addColorStop(0, startColor);
      g.addColorStop(1, stopColor);
      
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
   });
};

// --- CONNECTIONS ---
const drawConnections = () => {
    const threshold = 120;
    
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            
            // Fast check
            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) continue;
            
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < threshold) {
                const opacity = 1 - (dist / threshold);
                // Line color adapts to theme
                const color = isDark.value ? '100, 150, 255' : '99, 102, 241';
                ctx.strokeStyle = `rgba(${color}, ${opacity * 0.2})`;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
};

// --- CURSOR TRAIL ---
const updateAndDrawTrails = () => {
    if (trails.value.length < 3) return;

    for (let i = trails.value.length - 1; i >= 0; i--) {
        const pt = trails.value[i];
        pt.life -= 0.05;
        if (pt.life <= 0) {
            trails.value.splice(i, 1);
        }
    }
    
    if (trails.value.length < 3) return;

    ctx.beginPath();
    ctx.strokeStyle = isDark.value ? `rgba(0, 255, 255, 0.6)` : `rgba(79, 70, 229, 0.6)`;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let p0 = trails.value[0];
    ctx.moveTo(p0.x, p0.y);

    for (let i = 1; i < trails.value.length - 1; i++) {
        const p1 = trails.value[i];
        const p2 = trails.value[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    
    const last = trails.value[trails.value.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
};

const animate = () => {
  if (!canvasRef.value) return;
  
  // Clear logic depends on theme? No, standard clear.
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // 1. Draw Background Lights
  updateAndDrawlights();
  
  // 2. Draw Connections (Behind particles)
  drawConnections();
  
  // 3. Draw Particles
  particles.forEach(p => { p.update(); p.draw(); });
  
  // 4. Draw Trails
  updateAndDrawTrails();
  
  animationFrameId = requestAnimationFrame(animate);
};

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
    
    trails.value.push({
        x: e.clientX,
        y: e.clientY,
        life: 1.0
    });
    
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
  pointer-events: none;
}
</style>
