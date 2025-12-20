<template>
  <div class="glass p-6 rounded-xl border border-gray-700 bg-[#1b2127]">
    <h2 class="text-xl font-bold text-white mb-4">Issue Certificate</h2>

    <div class="flex flex-col gap-4">
      <!-- STUDENT DROPDOWN -->
      <label class="flex flex-col gap-1">
        <span class="text-gray-400 text-sm">Select Student</span>
        <select v-model="selectedStudentId" class="input-field">
          <option disabled value="">-- Choose a Student --</option>
          <option
            v-for="student in students"
            :key="student.id"
            :value="student.id"
          >
            {{ student.name }} ({{ student.roll || 'No ID' }})
          </option>
        </select>
      </label>

      <!-- CERTIFICATE TITLE -->
      <label class="flex flex-col gap-1">
        <span class="text-gray-400 text-sm">Certificate Title</span>
        <input
          v-model="title"
          class="input-field"
          placeholder="e.g. Bachelor of Science"
        />
      </label>

      <!-- DEPARTMENT -->
      <label class="flex flex-col gap-1">
        <span class="text-gray-400 text-sm">Department</span>
        <input
          v-model="department"
          class="input-field"
          placeholder="e.g. Computer Science"
        />
      </label>

      <!-- DESCRIPTION -->
      <label class="flex flex-col gap-1">
        <span class="text-gray-400 text-sm">Description</span>
        <textarea
          v-model="description"
          class="input-field h-24 resize-none"
          placeholder="Enter details about this certification..."
        ></textarea>
      </label>

      <!-- FILE UPLOAD -->
      <label class="flex flex-col gap-1">
        <span class="text-gray-400 text-sm">Certificate File (Image)</span>
        <input type="file" @change="onFileChange" class="input-field p-2" accept="image/*" />
      </label>

      <!-- SUBMIT BUTTON -->
      <button
        class="mt-4 px-6 py-3 rounded-lg font-bold text-white transition-all transform active:scale-95"
        :class="isFormValid ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'"
        :disabled="!isFormValid || isIssuing"
        @click="issueCertificate"
      >
        <span v-if="!isIssuing">Mint & Transfer NFT</span>
        <span v-else class="flex items-center justify-center gap-2">
           <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
           </svg>
           Processing...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Component props (not heavily used here but available for extensibility)
const props = defineProps(['apiBase']) 

// --- Reactive State ---
const students = ref([]) // List of students for the dropdown
const selectedStudentId = ref('') // ID of student to receive the certificate
const title = ref('') // Certificate name
const description = ref('') // Brief detail about the cert
const department = ref('') // Academic department
const selectedFile = ref(null) // The actual certificate image/file
const isIssuing = ref(false) // Loading state for the submit button

// --- Form Validation Logic ---
// Computed property: returns true only if essential fields are filled
const isFormValid = computed(() => {
  return selectedStudentId.value && title.value && selectedFile.value
})

/**
 * fetchStudents:
 * Fetches the list of students from the backend for the "Select Student" dropdown.
 */
async function fetchStudents() {
  try {
    const res = await fetch('http://localhost:3001/api/students', {
      headers: {
        // Authenticate request using either admin or user token
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`
      }
    })
    if (res.ok) {
      students.value = await res.json()
    }
  } catch (err) {
    console.error('Failed to fetch students:', err)
  }
}

/**
 * onFileChange:
 * Updates the selectedFile state whenever the user picks a new file from their computer.
 */
function onFileChange(e) {
  selectedFile.value = e.target.files[0]
}

/**
 * issueCertificate:
 * The primary action that triggers the issuance flow.
 * Consolidates form data and sends a multipart request to the backend.
 */
async function issueCertificate() {
  // Prevent submission if form is incomplete
  if (!isFormValid.value) return

  // Enable loading UI
  isIssuing.value = true

  // --- Prepare Data for Upload ---
  // Using FormData is required for sending files (binary data) via HTTP
  const formData = new FormData()
  formData.append('file', selectedFile.value) // Certificate image
  formData.append('recipientId', selectedStudentId.value) // Linking to specific student
  formData.append('title', title.value) 
  formData.append('description', description.value) 
  formData.append('department', department.value) 

  try {
    // POST request to the issue endpoint
    const res = await fetch('http://localhost:3001/api/nft/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`
        // Note: Content-Type is intentionally omitted here as FormData sets it automatically
      },
      body: formData
    })

    const data = await res.json()
    
    // Check status
    if (res.ok) {
      // Notify admin of success and show blockchain proof
      alert(`✅ Success! NFT Minted.\nTx Hash: ${data.nft.transactionHash}`)
      resetForm() // Clear the form for the next issuance
    } else {
      throw new Error(data.error || 'Failed to issue NFT')
    }
  } catch (err) {
    console.error('Issue error:', err)
    alert(`❌ Error: ${err.message}`)
  } finally {
    // Disable loading UI
    isIssuing.value = false
  }
}

/**
 * resetForm:
 * Clears all input fields to their initial empty values.
 */
function resetForm() {
  title.value = ''
  description.value = ''
  department.value = ''
  selectedFile.value = null
  selectedStudentId.value = ''
}

// Automatically populate the student dropdown when the form component is loaded
onMounted(fetchStudents)
</script>


<style scoped>
.input-field {
  @apply w-full rounded-lg bg-transparent border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all;
}
</style>
