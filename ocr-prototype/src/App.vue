<script setup>
import { ref, reactive, computed } from 'vue';
import Tesseract from 'tesseract.js';

// --- 1. THE DATA (Simulated Database) ---
const studentDB = [
  { id: 1, full_name: "Rohan Sharma", student_id_number: "2024-001", email: "rohan@example.com", course_name: "Computer Science", year: "2024" },
  { id: 2, full_name: "Sarah Lee", student_id_number: "2024-002", email: "sarah@example.com", course_name: "Mechanical Eng", year: "2023" },
  { id: 3, full_name: "Amit Patel", student_id_number: "2024-003", email: "amit@example.com", course_name: "Civil Eng", year: "2024" },
  // AMBIGUITY TEST CASES
  { id: 4, full_name: "Harsh Chauhan", student_id_number: "2024-004", email: "harsh.c@example.com", course_name: "Computer Science", year: "2024" },
  { id: 5, full_name: "Harsh Surve", student_id_number: "2024-005", email: "harsh.s@example.com", course_name: "Information Tech", year: "2024" },
  { id: 6, full_name: "Manthan Dube", student_id_number: "2024-006", email: "manthan@example.com", course_name: "B.Tech", year: "2025" },
  { id: 7, full_name: "Ranthan Dube", student_id_number: "2024-007", email: "ranthan@example.com", course_name: "B.Sc", year: "2025" }
];

const showDebug = ref(false);

// --- STATE MANAGEMENT ---
const step = ref(1); // 1:Upload, 2:Processing, 3:Summary, 4:Review
const filesQueue = ref([]);
const stats = reactive({ matched: 0, unknown: 0 });
const currentProcessingIndex = ref(0);

// Logic: Image Pre-processing (Grayscale + Binarization)
const preprocessImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Pixel Manipulation
        for (let i = 0; i < data.length; i += 4) {
          // 1. Grayscale (Average luminosity)
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // 2. Binary Thresholding (Standard 128 midpoint)
          // This removes noise and makes text pops against background
          const val = avg > 128 ? 255 : 0;
          
          data[i]     = val; // Red
          data[i + 1] = val; // Green
          data[i + 2] = val; // Blue
          // Alpha (data[i+3]) remains unchanged
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// --- ACTIONS ---

// Step 1: Handle File Selection
const handleFiles = (e) => {
  const selected = Array.from(e.target.files);
  if (!selected.length) return;

  // Init Queue
  filesQueue.value = selected.map((file, index) => ({
    id: index,
    file,
    preview: URL.createObjectURL(file), // Create thumbnail URL
    processedPreview: null, // B&W version
    text: '',
    match: null, // { student, confidence, method }
    candidates: null, // For ambiguous matches
    status: 'pending' // pending | processing | done | error
  }));
};

const startAnalysis = async () => {
  if (filesQueue.value.length === 0) return;
  
  step.value = 2;
  stats.matched = 0;
  stats.unknown = 0;
  currentProcessingIndex.value = 0;

  // Process sequentially to follow "Scanning X/Y" logic
  for (let i = 0; i < filesQueue.value.length; i++) {
    currentProcessingIndex.value = i + 1;
    const item = filesQueue.value[i];
    item.status = 'processing';

    try {
      // PRE-PROCESS BEFORE OCR
      const processedImg = await preprocessImage(item.file);
      item.processedPreview = processedImg;

      const { data: { text } } = await Tesseract.recognize(processedImg, 'eng');
      item.text = text;
      
      // RUN MATCHING
      const match = findMatch(text);
      if (match) {
        item.match = match.student;
        item.candidates = match.candidates || null; // Store candidates if any
        item.status = 'done';
        
        if (match.method === 'Ambiguous') {
             // For stats, maybe count as unknown or separate? 
             // Let's count as matched for now to avoid red box, or unknown?
             // User sees yellow warning, so maybe 'matched' in terms of "we found something"
             // But let's stick to existing stats logic:
             if (item.match) stats.matched++;
             else stats.unknown++;
        } else {
             stats.matched++;
        }
      } else {
        item.match = null;
        item.candidates = null;
        item.status = 'done'; 
        stats.unknown++;
      }
    } catch (err) {
      console.error(err);
      item.text = "Error: " + err.message;
      item.status = 'error';
      stats.unknown++;
    }
  }

  // All done
  step.value = 3;
};

// Logic: Smart Matcher with Multi-Factor Check
const findMatch = (text) => {
  const normalized = text.toLowerCase();
  
  // 1. Check Unique Identifiers (ID & Email) - ABSOLUTE PRIORITY
  for (const student of studentDB) {
     if (normalized.includes(student.student_id_number.toLowerCase())) {
       return { student, method: 'ID Match', confidence: 'High' };
     }
     if (student.email && normalized.includes(student.email.toLowerCase())) {
       return { student, method: 'Email Match', confidence: 'High' };
     }
  }

  // 2. Collect Fuzzy Name Candidates
  const candidates = [];
  const textTokens = normalized.split(/\s+/);

  for (const student of studentDB) {
    const nameParts = student.full_name.toLowerCase().split(/\s+/);
    let partsFound = 0;

    for (const part of nameParts) {
      if (normalized.includes(part)) {
        partsFound++;
        continue;
      }
      // Fuzzy check
      for (const token of textTokens) {
        // TIGHTER THRESHOLD:
        // Length <= 5: Max 1 edit (prevents Sarah <-> Harsh)
        // Length > 5: Max 2 edits
        const allowedDist = part.length > 5 ? 2 : 1;
        
        if (Math.abs(token.length - part.length) <= allowedDist) {
             if (levenshtein(token, part) <= allowedDist) {
                 partsFound++;
                 break; 
             }
        }
      }
    }

    // Name Score
    const nameScore = partsFound / nameParts.length;
    
    // Context Score (Tie-Breaker)
    let contextScore = 0;
    if (student.course_name && normalized.includes(student.course_name.toLowerCase())) contextScore += 0.5;
    if (student.year && normalized.includes(student.year)) contextScore += 0.2;

    // Threshold: Match if name score is decent
    if (nameScore >= 0.5) {
      candidates.push({ 
          student, 
          score: nameScore + contextScore, // Context boosts the total score
          baseScore: nameScore,
          contextScore 
      });
    }
  }

  // 3. Analyze Candidates
  if (candidates.length === 0) return null;

  // Sort by Total Score descending
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 1) {
    return { student: candidates[0].student, method: 'Fuzzy Name', confidence: candidates[0].score >= 1 ? 'High' : 'Medium' };
  }

  // MULTI-FACTOR DECISION
  const winner = candidates[0];
  const runnerUp = candidates[1];

  // Logic: If winner has Context Match (e.g. Course found) and runnerUp doesn't
  if (winner.contextScore > 0 && runnerUp.contextScore === 0) {
      return { student: winner.student, method: 'Name + Context Match', confidence: 'High' };
  }

  // Logic: Significant Score Difference
  if (winner.score > runnerUp.score + 0.3) {
     return { student: winner.student, method: 'Best Match', confidence: 'Medium' };
  }

  // Otherwise, Ambiguous
  return { 
      student: null, 
      method: 'Ambiguous', 
      candidates: candidates.map(c => c.student),
      confidence: 'Low'
  };
};

// Helper: Levenshtein Distance (for typos like 'sarah' -> 'karah')
const levenshtein = (a, b) => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Step 3: Actions
const closeSummary = () => {
  step.value = 4;
};

// Step 4: Reset
const reset = () => {
  filesQueue.value = [];
  step.value = 1;
};

const simulateIssue = () => {
  alert("Simulating Batch Minting to Blockchain...");
  reset();
};

</script>

<template>
  <div class="app-container">
    <header>
      <h1>Batch OCR Prototype</h1>
      <p>Simulating Bulk Certificate Issuance</p>
      
      <!-- NEW: DEBUG TOGGLE -->
      <div class="debug-controls">
         <label class="toggle-switch">
           <input type="checkbox" v-model="showDebug" />
           <span class="slider round"></span>
         </label>
         <span class="toggle-label">Robot View (B&W Debug)</span>
      </div>
    </header>

    <!-- STEP 1: UPLOAD -->
    <div v-if="step === 1" class="step-card">
      <div class="upload-zone">
        <h2>📂 Step 1: Select Documents</h2>
        <input type="file" multiple @change="handleFiles" accept="image/*" />
        <p v-if="filesQueue.length" class="file-count">{{ filesQueue.length }} files selected</p>
        
        <button 
          v-if="filesQueue.length" 
          @click="startAnalysis"
          class="primary-btn"
        >
          Start Batch Analysis
        </button>
      </div>
    </div>

    <!-- STEP 2: PROCESSING -->
    <div v-if="step === 2" class="step-card processing">
      <h2>⚙️ Processing...</h2>
      <p>Scanning Document {{ currentProcessingIndex }} of {{ filesQueue.length }}</p>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: (currentProcessingIndex / filesQueue.length) * 100 + '%' }"
        ></div>
      </div>

      <div class="log-output">
        <div v-for="f in filesQueue" :key="f.id" class="log-item">
          <span v-if="f.status === 'processing'">🔄 {{ f.file.name }}...</span>
          <span v-else-if="f.status === 'done'">✅ {{ f.file.name }}</span>
          <span v-else class="text-gray">{{ f.file.name }}</span>
        </div>
      </div>
    </div>

    <!-- STEP 3: SUMMARY POPUP (MODAL) -->
    <div v-if="step === 3" class="modal-overlay">
      <div class="modal-card">
        <div class="icon">📊</div>
        <h2>Analysis Complete!</h2>
        
        <div class="stats-grid">
          <div class="stat green">
            <span class="count">{{ stats.matched }}</span>
            <span class="label">Matched</span>
          </div>
          <div class="stat red">
            <span class="count">{{ stats.unknown }}</span>
            <span class="label">Unknown</span>
          </div>
        </div>

        <button @click="closeSummary" class="primary-btn full-width">
          Review Results
        </button>
      </div>
    </div>

    <!-- STEP 4: REVIEW DASHBOARD -->
    <div v-if="step === 4" class="dashboard">
      <div class="dash-header">
        <h2>Verify & Issue</h2>
        <div class="header-actions">
          <button @click="reset" class="secondary-btn">Start Over</button>
          <button class="primary-btn" @click="simulateIssue">Issue All Certificates</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Extracted Text (Snippet)</th>
            <th>Detected Student</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filesQueue" :key="item.id" :class="{ unknown: !item.match }">
            <td>
              <!-- IMAGE PREVIEW (Toggle between Raw and Processed) -->
              <img 
                :src="showDebug && item.processedPreview ? item.processedPreview : item.preview" 
                class="thumbnail" 
                :class="{ 'robot-view': showDebug }"
              />
            </td>
            <td>
              <div class="text-snippet" :title="item.text">
                {{ item.text.slice(0, 50) }}...
              </div>
            </td>
            <td>
              <select v-if="item.match" v-model="item.match" class="dropdown">
                <option :value="item.match">
                    {{ item.match.full_name }} ({{ item.match.student_id_number }})
                </option>
                <option v-for="s in studentDB" :key="s.id" :value="s">
                    {{ s.full_name }} - {{ s.course_name }}
                </option>
              </select>

              <!-- AMBIGUOUS CASE -->
              <div v-else-if="item.match === null && item.candidates" class="ambiguous-selector">
                <span class="badgewarning">⚠️ Multiple Matches</span>
                <select v-model="item.match" class="dropdown warning">
                   <option :value="null">-- Select Correct Student --</option>
                   <option v-for="cand in item.candidates" :key="cand.id" :value="cand">
                     {{ cand.full_name }} ({{ cand.course_name }}, {{ cand.year }})
                   </option>
                </select>
              </div>
              
              <select v-else class="dropdown warning">
                <option :value="null">-- Unknown --</option>
                <option v-for="s in studentDB" :key="s.id" :value="s">
                    {{ s.full_name }} ({{ s.student_id_number }})
                </option>
              </select>
            </td>
            <td class="status-cell">
              <span v-if="item.match">✅ Ready</span>
              <span v-else-if="item.candidates">⚠️ Ambiguous</span>
              <span v-else>❌ Unknown</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
/* RESET & BASE */
.app-container {
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  color: #eee;
}

.badgewarning {
    background: #ffa50033;
    color: orange;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8em;
    display: block;
    width: fit-content;
    margin-bottom: 4px;
}

header {
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.robot-view {
    image-rendering: pixelated;
    border: 1px solid #646cff;
}

.full-width {
    width: 100%;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

/* TOGGLE SWITCH CSS */
.debug-controls {
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    background: #222;
    border-radius: 30px;
    border: 1px solid #444;
    display: flex;
    align-items: center;
    gap: 10px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #555;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #646cff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.toggle-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #aaa;
}

/* CARDS */
.step-card {
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #444;
  text-align: center;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* BUTTONS */
.primary-btn {
  background: #646cff;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.primary-btn:hover { background: #535bf2; }

.secondary-btn {
  background: #444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* PROGRESS */
.progress-bar {
  width: 100%;
  height: 10px;
  background: #111;
  border-radius: 5px;
  overflow: hidden;
  margin: 1rem 0;
}
.progress-fill {
  height: 100%;
  background: #646cff;
  transition: width 0.3s ease;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(5px);
}
.modal-card {
  background: #222;
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid #555;
  text-align: center;
  width: 90%;
  max-width: 400px;
}
.icon { font-size: 3rem; margin-bottom: 1rem; }
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
}
.stat {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.stat.green { background: rgba(66, 184, 131, 0.2); border: 1px solid #42b883; }
.stat.red { background: rgba(255, 77, 77, 0.2); border: 1px solid #ff4d4d; }
.count { font-size: 1.5rem; font-weight: bold; }

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}
th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #333;
}
th { background: #222; color: #aaa; }
.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.dropdown {
  background: #333;
  color: white;
  border: 1px solid #555;
  padding: 0.5rem;
  border-radius: 4px;
}
.dropdown.warning { border-color: orange; }
.text-snippet {
  font-family: monospace;
  color: #888;
  font-size: 0.9rem;
}
</style>
