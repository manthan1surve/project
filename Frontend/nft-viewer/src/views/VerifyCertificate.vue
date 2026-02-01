<template>
  <div class="min-h-screen bg-[#0d1117] text-white">
    <AppHeader />
    
    <main class="pt-24 pb-16 px-4">
      <div class="max-w-2xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Record Integrity Inspection</h1>
          <p class="text-gray-400">Independently assess credential record integrity using blockchain proof</p>
        </div>

        <!-- Search Box (if no tokenId in URL) -->
        <div v-if="!tokenId" class="glass p-6 rounded-xl border border-gray-700 bg-[#1b2127] mb-6">
          <label class="block text-gray-400 text-sm mb-2">Enter Token ID</label>
          <div class="flex gap-3">
            <input 
              v-model="searchTokenId"
              type="number"
              placeholder="e.g. 1"
              class="flex-1 input-field"
              @keyup.enter="searchCertificate"
            />
            <button 
              @click="searchCertificate"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all"
            >
              🔍 Inspect
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="text-gray-400 mt-4">Querying blockchain...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="glass p-6 rounded-xl border border-red-600/50 bg-red-900/20">
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-red-400 font-bold">Inspection Failed</h3>
              <p class="text-gray-400">{{ error }}</p>
            </div>
          </div>
          <div class="mt-4">
            <router-link to="/verify" class="text-blue-400 hover:text-blue-300 text-sm">
              ← Try another Token ID
            </router-link>
          </div>
        </div>

        <!-- Inspection Result -->
        <div v-else-if="verification" class="space-y-6">
          
          <!-- Status Badge -->
          <div 
            class="glass p-6 rounded-xl border"
            :class="verification.valid ? 'border-green-600/50 bg-green-900/20' : 'border-yellow-600/50 bg-yellow-900/20'"
          >
            <div class="flex items-center gap-4">
              <!-- Active Icon -->
              <div v-if="verification.valid" class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <!-- Inactive Icon -->
              <div v-else class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h2 class="text-2xl font-bold" :class="verification.valid ? 'text-green-400' : 'text-yellow-400'">
                  {{ verification.valid ? 'ACTIVE' : 'INACTIVE' }}
                </h2>
                <p class="text-gray-400">{{ verification.valid ? 'Record is anchored and status is active' : 'Record status has been set to inactive' }}</p>
              </div>
            </div>
          </div>

          <!-- Record Details -->
          <div class="glass p-6 rounded-xl border border-gray-700 bg-[#1b2127]">
            <h3 class="text-lg font-bold text-white mb-4">Record Details</h3>
            
            <div class="grid gap-4">
              <div class="flex justify-between py-2 border-b border-gray-700">
                <span class="text-gray-400">Token ID</span>
                <span class="text-white font-mono">#{{ verification.tokenId }}</span>
              </div>
              
              <div v-if="verification.certificate" class="space-y-3">
                <div class="flex justify-between py-2 border-b border-gray-700">
                  <span class="text-gray-400">Title</span>
                  <span class="text-white">{{ verification.certificate.title }}</span>
                </div>
                <div v-if="verification.certificate.student" class="flex justify-between py-2 border-b border-gray-700">
                  <span class="text-gray-400">Recipient</span>
                  <span class="text-white">{{ verification.certificate.student.full_name }}</span>
                </div>
                <div v-if="verification.certificate.student" class="flex justify-between py-2 border-b border-gray-700">
                  <span class="text-gray-400">Student ID</span>
                  <span class="text-white font-mono">{{ verification.certificate.student.student_id_number }}</span>
                </div>
                <div v-if="verification.certificate.department" class="flex justify-between py-2 border-b border-gray-700">
                  <span class="text-gray-400">Department</span>
                  <span class="text-white">{{ verification.certificate.department }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-700">
                  <span class="text-gray-400">Anchor Date</span>
                  <span class="text-white">{{ formatDate(verification.certificate.issue_date) }}</span>
                </div>
              </div>

              <div class="flex justify-between py-2 border-b border-gray-700">
                <span class="text-gray-400">Owner Address</span>
                <span class="text-white font-mono text-sm truncate max-w-[200px]">{{ verification.owner }}</span>
              </div>
              
              <div class="flex justify-between py-2">
                <span class="text-gray-400">Contract</span>
                <span class="text-blue-400 font-mono text-sm truncate max-w-[200px]">{{ verification.contractAddress }}</span>
              </div>
            </div>
          </div>

          <!-- Cryptographic Evidence -->
          <div class="glass p-6 rounded-xl border border-blue-600/30 bg-blue-900/10">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🔐</span> Cryptographic Evidence
            </h3>
            <p class="text-gray-400 text-sm mb-4">
              The following data is read directly from the blockchain and can be independently verified.
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex gap-2">
                <span class="text-gray-500">Owner:</span>
                <span class="text-blue-400 font-mono break-all">{{ verification.owner }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-gray-500">Contract:</span>
                <span class="text-blue-400 font-mono break-all">{{ verification.contractAddress }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-gray-500">Token ID:</span>
                <span class="text-white font-mono">{{ verification.tokenId }}</span>
              </div>
            </div>
          </div>

          <!-- QR Code -->
          <div v-if="verification.qrCode" class="glass p-6 rounded-xl border border-gray-700 bg-[#1b2127] text-center">
            <h3 class="text-lg font-bold text-white mb-4">Share This Record</h3>
            <img :src="verification.qrCode" alt="Inspection QR Code" class="mx-auto rounded-lg" />
            <p class="text-gray-400 text-sm mt-3">Scan to inspect this record</p>
          </div>

          <!-- Blockchain Proof -->
          <div class="glass p-4 rounded-xl border border-gray-700 bg-[#0d1117]">
            <div class="flex items-center gap-2 text-gray-400 text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Inspected on Ethereum blockchain at {{ verification.verifiedAt }}</span>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p class="text-yellow-200/70 text-xs">
              ⚠️ This inspection provides cryptographic evidence for independent integrity assessment. 
              The system does not claim institutional authority. Trust decisions remain with the inspecting party.
            </p>
          </div>

          <!-- Back Button -->
          <div class="text-center">
            <router-link to="/" class="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const route = useRoute()
const router = useRouter()

const tokenId = ref(null)
const searchTokenId = ref('')
const loading = ref(false)
const error = ref(null)
const verification = ref(null)

const API_BASE = 'http://localhost:3001'

async function verifyCertificate(id) {
  loading.value = true
  error.value = null
  verification.value = null
  
  try {
    const res = await fetch(`${API_BASE}/api/verify/${id}`)
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.reason || data.error || 'Record not found')
    }
    
    verification.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function searchCertificate() {
  if (searchTokenId.value) {
    router.push(`/verify/${searchTokenId.value}`)
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watch route changes
watch(() => route.params.tokenId, (newId) => {
  if (newId) {
    tokenId.value = newId
    verifyCertificate(newId)
  } else {
    tokenId.value = null
    verification.value = null
  }
}, { immediate: true })

onMounted(() => {
  if (route.params.tokenId) {
    tokenId.value = route.params.tokenId
    verifyCertificate(route.params.tokenId)
  }
})
</script>

<style scoped>
.glass {
  backdrop-filter: blur(10px);
}

.input-field {
  @apply w-full rounded-lg bg-transparent border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all;
}
</style>
