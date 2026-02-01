<template>
  <section class="bg-transparent p-6 rounded-xl fade-slide-up">
    <div class="flex justify-between items-center mb-4">
      <h2 class="section-title">Issued Certificates</h2>
      <button @click="fetchCertificates" class="text-blue-400 hover:text-blue-300 text-sm">
        ↻ Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
    </div>

    <!-- Certificates Table -->
    <div v-else class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Student</th>
            <th>Certificate</th>
            <th>Token ID</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(c, i) in certificates"
            :key="c.id"
            class="hover:bg-white/5 transition fade-slide-up"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <td>{{ c.student?.full_name || 'Unknown' }}</td>
            <td>{{ c.title }}</td>
            <td class="font-mono">{{ c.tokenId ? `#${c.tokenId}` : 'N/A' }}</td>
            <td>
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="c.isRevoked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'"
              >
                {{ c.isRevoked ? 'REVOKED' : 'VALID' }}
              </span>
            </td>
            <td>{{ formatDate(c.issue_date) }}</td>
            <td>
              <div class="flex gap-2 flex-wrap">
                <!-- View Button -->
                <a 
                  v-if="c.tokenId"
                  :href="`/verify/${c.tokenId}`" 
                  target="_blank"
                  class="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 border border-blue-400/30 rounded hover:bg-blue-500/10"
                >
                  👁 View
                </a>
                
                <!-- QR Code Button -->
                <button 
                  v-if="c.tokenId"
                  @click="showQRCode(c)"
                  class="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 border border-purple-400/30 rounded hover:bg-purple-500/10"
                >
                  📱 QR
                </button>
                
                <!-- Revoke/Reinstate Button -->
                <button 
                  v-if="c.tokenId"
                  @click="toggleRevocation(c)"
                  :disabled="c.processing"
                  class="text-sm px-2 py-1 border rounded transition-colors"
                  :class="c.isRevoked 
                    ? 'text-green-400 border-green-400/30 hover:bg-green-500/10' 
                    : 'text-red-400 border-red-400/30 hover:bg-red-500/10'"
                >
                  <span v-if="c.processing">...</span>
                  <span v-else>{{ c.isRevoked ? '✓ Reinstate' : '✗ Revoke' }}</span>
                </button>

                <!-- No Token Warning -->
                <span v-if="!c.tokenId" class="text-gray-500 text-xs">
                  No blockchain record
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="certificates.length === 0 && !loading" class="text-gray-400 text-center py-8">
      No certificates issued yet.
    </p>

    <p class="immutable-note mt-3">
      Certificates are stored on the blockchain. Revocation is recorded permanently.
    </p>

    <!-- QR Code Modal -->
    <div v-if="qrModal.show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="qrModal.show = false">
      <div class="bg-[#1b2127] p-6 rounded-xl border border-gray-700 max-w-sm">
        <h3 class="text-white text-lg font-bold mb-4 text-center">Verification QR Code</h3>
        <div v-if="qrModal.loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <div v-else>
          <img v-if="qrModal.qrCode" :src="qrModal.qrCode" alt="QR Code" class="mx-auto rounded-lg mb-4" />
          <p class="text-gray-400 text-sm text-center mb-4">
            Token #{{ qrModal.tokenId }} - {{ qrModal.title }}
          </p>
          <div class="flex gap-2">
            <button 
              @click="copyVerificationLink(qrModal.tokenId)"
              class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
            >
              📋 Copy Link
            </button>
            <button 
              @click="qrModal.show = false"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const certificates = ref([])
const loading = ref(false)

const qrModal = reactive({
  show: false,
  loading: false,
  qrCode: null,
  tokenId: null,
  title: ''
})

const API_BASE = 'http://localhost:3001'

async function fetchCertificates() {
  loading.value = true
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    
    // Fetch certificates with student and nft data
    const res = await fetch(`${API_BASE}/api/certificates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      const data = await res.json()
      console.log('Fetched certificates:', data) // Debug log
      
      // Process each certificate
      for (const cert of data) {
        // Handle both nft object and direct token_id
        cert.tokenId = cert.nft?.token_id || cert.token_id || null
        
        // Check revocation status for each certificate with a token
        if (cert.tokenId) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify/${cert.tokenId}`)
            if (verifyRes.ok) {
              const verifyData = await verifyRes.json()
              cert.isRevoked = verifyData.isRevoked || false
            } else {
              cert.isRevoked = false
            }
          } catch (err) {
            console.error('Verify error for token', cert.tokenId, err)
            cert.isRevoked = false
          }
        } else {
          cert.isRevoked = false
        }
        cert.processing = false
      }
      
      certificates.value = data
    } else {
      console.error('Failed to fetch certificates:', res.status)
    }
  } catch (err) {
    console.error('Failed to fetch certificates:', err)
  } finally {
    loading.value = false
  }
}

async function showQRCode(cert) {
  qrModal.show = true
  qrModal.loading = true
  qrModal.tokenId = cert.tokenId
  qrModal.title = cert.title
  
  try {
    const res = await fetch(`${API_BASE}/api/verify/qr/${cert.tokenId}`)
    if (res.ok) {
      const data = await res.json()
      qrModal.qrCode = data.qrCode
    } else {
      throw new Error('Failed to generate QR')
    }
  } catch (err) {
    console.error('QR error:', err)
    alert('Failed to generate QR code')
    qrModal.show = false
  } finally {
    qrModal.loading = false
  }
}

async function copyVerificationLink(tokenId) {
  const link = `${window.location.origin}/verify/${tokenId}`
  try {
    await navigator.clipboard.writeText(link)
    alert('Verification link copied!')
  } catch {
    prompt('Copy this link:', link)
  }
}

async function toggleRevocation(cert) {
  if (!cert.tokenId) return
  
  const action = cert.isRevoked ? 'reinstate' : 'revoke'
  const confirmed = confirm(`Are you sure you want to ${action} this certificate?`)
  
  if (!confirmed) return
  
  cert.processing = true
  
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/api/verify/${action}/${cert.tokenId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      cert.isRevoked = !cert.isRevoked
      alert(`Certificate ${action}d successfully!`)
    } else {
      const data = await res.json()
      throw new Error(data.error || `Failed to ${action}`)
    }
  } catch (err) {
    console.error(`${action} error:`, err)
    alert(`Failed to ${action} certificate: ${err.message}`)
  } finally {
    cert.processing = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(fetchCertificates)
</script>

<style scoped>
.table {
  @apply text-left text-gray-300;
}
.table th {
  @apply text-gray-400 text-sm font-medium pb-3 border-b border-gray-700;
}
.table td {
  @apply py-3 border-b border-gray-800;
}
</style>


