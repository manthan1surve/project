<script setup>
import { ref, reactive } from 'vue'

const API_BASE = 'http://localhost:3001'

// File upload state
const selectedFile = ref(null)
const isDragging = ref(false)

// Processing state
const isProcessing = ref(false)
const results = reactive({
  show: false,
  message: '',
  total: 0,
  success: 0,
  failed: 0,
  errors: [],
  data: [] // registered students
})

// Get auth token
const getToken = () => localStorage.getItem('authToken')

// Handle file selection
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file && file.name.endsWith('.csv')) {
    selectedFile.value = file
  } else {
    alert('Please select a CSV file')
  }
}

// Handle drag and drop
const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.name.endsWith('.csv')) {
    selectedFile.value = file
  } else {
    alert('Please drop a CSV file')
  }
}

// Download template
const downloadTemplate = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/batch/template/students`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student_registration_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Template download failed:', err)
  }
}

// Process upload
const processUpload = async () => {
  if (!selectedFile.value) return

  isProcessing.value = true
  results.show = false

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetch(`${API_BASE}/api/batch/students`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    // Update results
    results.message = data.message
    results.total = data.results.total
    results.success = data.results.success
    results.failed = data.results.failed
    results.errors = data.results.errors || []
    results.data = data.results.registered || []
    results.show = true

  } catch (err) {
    results.message = err.message
    results.total = 0
    results.success = 0
    results.failed = 1
    results.errors = [{ error: err.message }]
    results.data = []
    results.show = true
  } finally {
    isProcessing.value = false
    selectedFile.value = null
  }
}

// Reset
const reset = () => {
  selectedFile.value = null
  results.show = false
}
</script>

<template>
  <div class="batch-operations">
    <!-- Instructions -->
    <div class="instructions">
      <h3>Bulk Student Registration</h3>
      
      <p>
        Upload a CSV file to register multiple students at once. Each student will get a wallet created automatically.
      </p>

      <button class="template-btn" @click="downloadTemplate()">
        📥 Download CSV Template
      </button>
    </div>

    <!-- Upload Zone -->
    <div 
      class="upload-zone"
      :class="{ dragging: isDragging, 'has-file': selectedFile }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="handleDrop"
    >
      <div v-if="!selectedFile" class="upload-prompt">
        <span class="icon">📂</span>
        <p>Drag and drop your CSV file here</p>
        <p class="or">or</p>
        <label class="file-input-label">
          Browse Files
          <input type="file" accept=".csv" @change="handleFileSelect" hidden />
        </label>
      </div>

      <div v-else class="file-selected">
        <span class="icon">✅</span>
        <p>{{ selectedFile.name }}</p>
        <button class="remove-btn" @click="selectedFile = null">✕</button>
      </div>
    </div>

    <!-- Process Button -->
    <button 
      v-if="selectedFile && !isProcessing"
      class="process-btn"
      @click="processUpload"
    >
      🚀 Register Students
    </button>

    <!-- Processing Indicator -->
    <div v-if="isProcessing" class="processing">
      <div class="spinner"></div>
      <p>Processing CSV file...</p>
    </div>

    <!-- Results -->
    <div v-if="results.show" class="results">
      <div class="results-header">
        <h3>{{ results.message }}</h3>
      </div>

      <div class="stats-grid">
        <div class="stat success">
          <span class="count">{{ results.success }}</span>
          <span class="label">Success</span>
        </div>
        <div class="stat failed">
          <span class="count">{{ results.failed }}</span>
          <span class="label">Failed</span>
        </div>
        <div class="stat total">
          <span class="count">{{ results.total }}</span>
          <span class="label">Total</span>
        </div>
      </div>

      <!-- Success Table -->
      <div v-if="results.data.length > 0" class="success-table">
        <h4>✅ Successfully Processed</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Wallet</th>
              <th>Temp Password</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in results.data" :key="idx">
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
              <td class="mono">{{ item.wallet?.slice(0, 10) }}...</td>
              <td class="password">{{ item.tempPassword }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Errors Table -->
      <div v-if="results.errors.length > 0" class="errors-table">
        <h4>❌ Errors</h4>
        <table>
          <thead>
            <tr>
              <th>Row</th>
              <th>Error</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(err, idx) in results.errors" :key="idx">
              <td>{{ err.row || '-' }}</td>
              <td>{{ err.error }}</td>
              <td>{{ err.email || err.identifier || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button class="reset-btn" @click="reset">
        Start New Upload
      </button>
    </div>
  </div>
</template>

<style scoped>
.batch-operations {
  padding: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #8b949e;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.tabs button.active {
  background: #238636;
  border-color: #238636;
  color: white;
}

.tabs button:hover:not(.active) {
  background: #21262d;
}

.instructions {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.instructions h3 {
  color: #58a6ff;
  margin: 0 0 0.5rem 0;
}

.instructions p {
  color: #8b949e;
  margin: 0 0 1rem 0;
}

.template-btn {
  background: #21262d;
  border: 1px solid #30363d;
  color: #58a6ff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.template-btn:hover {
  background: #30363d;
}

.upload-zone {
  border: 2px dashed #30363d;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.upload-zone.dragging {
  border-color: #58a6ff;
  background: rgba(88, 166, 255, 0.1);
}

.upload-zone.has-file {
  border-color: #238636;
  background: rgba(35, 134, 54, 0.1);
}

.upload-prompt .icon,
.file-selected .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.upload-prompt p {
  color: #8b949e;
  margin: 0.5rem 0;
}

.or {
  color: #6e7681;
  font-size: 0.85rem;
}

.file-input-label {
  display: inline-block;
  background: #238636;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.file-input-label:hover {
  background: #2ea043;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.file-selected p {
  color: #c9d1d9;
  margin: 0;
}

.remove-btn {
  background: #da3633;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.process-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #238636, #2ea043);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.process-btn:hover {
  filter: brightness(1.1);
}

.processing {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #30363d;
  border-top-color: #58a6ff;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.results-header h3 {
  margin: 0 0 1rem 0;
  color: #c9d1d9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat.success {
  background: rgba(35, 134, 54, 0.2);
  border: 1px solid #238636;
}

.stat.failed {
  background: rgba(218, 54, 51, 0.2);
  border: 1px solid #da3633;
}

.stat.total {
  background: rgba(88, 166, 255, 0.2);
  border: 1px solid #58a6ff;
}

.stat .count {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #c9d1d9;
}

.stat .label {
  color: #8b949e;
  font-size: 0.85rem;
}

.success-table,
.errors-table {
  margin-top: 1.5rem;
}

.success-table h4,
.errors-table h4 {
  margin: 0 0 0.75rem 0;
  color: #c9d1d9;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #30363d;
}

th {
  color: #8b949e;
  font-weight: 500;
}

td {
  color: #c9d1d9;
}

.mono {
  font-family: monospace;
  color: #8b949e;
}

.password {
  background: #21262d;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.reset-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #8b949e;
  cursor: pointer;
}

.reset-btn:hover {
  background: #30363d;
  color: #c9d1d9;
}
</style>
