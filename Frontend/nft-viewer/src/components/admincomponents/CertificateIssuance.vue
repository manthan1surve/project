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

const props = defineProps(['apiBase']) // Optional if we just use hardcoded base url

// State
const students = ref([])
const selectedStudentId = ref('')
const title = ref('')
const description = ref('')
const department = ref('')
const selectedFile = ref(null)
const isIssuing = ref(false)

// Computed Validation
const isFormValid = computed(() => {
  return selectedStudentId.value && title.value && selectedFile.value
})

async function fetchStudents() {
  try {
    const res = await fetch('http://localhost:3001/api/students', {
      headers: {
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

function onFileChange(e) {
  selectedFile.value = e.target.files[0]
}

async function issueCertificate() {
  if (!isFormValid.value) return

  isIssuing.value = true

  // Create FormData explicitly matching backend expectation
  const formData = new FormData()
  formData.append('file', selectedFile.value) // req.file
  formData.append('recipientId', selectedStudentId.value) // req.body.recipientId
  formData.append('title', title.value) // req.body.title
  formData.append('description', description.value) // req.body.description
  formData.append('department', department.value) // req.body.department

  try {
    const res = await fetch('http://localhost:3001/api/nft/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`
        // Do NOT set Content-Type for FormData; fetch handles it with boundaries
      },
      body: formData
    })

    const data = await res.json()
    
    if (res.ok) {
      alert(`✅ Success! NFT Minted.\nTx Hash: ${data.nft.transactionHash}`)
      resetForm()
    } else {
      throw new Error(data.error || 'Failed to issue NFT')
    }
  } catch (err) {
    console.error('Issue error:', err)
    alert(`❌ Error: ${err.message}`)
  } finally {
    isIssuing.value = false
  }
}

function resetForm() {
  title.value = ''
  description.value = ''
  department.value = ''
  selectedFile.value = null
  selectedStudentId.value = ''
  // Reset file input visually if needed, though simple binding reset is often enough
}

onMounted(fetchStudents)
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg bg-[#111418] border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all;
}
</style>
