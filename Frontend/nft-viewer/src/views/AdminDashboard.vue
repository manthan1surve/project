<script setup>
import { ref, reactive, onMounted, computed } from 'vue' // Vue composition API utilities
import { useRouter } from 'vue-router' // Router for page navigation
import CertificateIssuance from '../components/admincomponents/CertificateIssuance.vue' // Custom component for certificate issuance form

// Initialize router instance
const router = useRouter()
// State to track the currently selected tab in the UI
const activeTab = ref('dashboard')
// Reactive arrays to hold fetched data
const students = ref([])
const certificates = ref([])

// QR Modal state
const qrModal = reactive({
  show: false,
  loading: false,
  qrCode: null,
  tokenId: null,
  title: ''
})

// Computed properties for dashboard summary statistics
const totalStudents = computed(() => students.value.length)
const totalIssued = computed(() => certificates.value.length)

const API_BASE = 'http://localhost:3001'

/**
 * fetchDashboardData:
 * Retrieves system-wide data (students and all issued certificates) for the admin overview.
 * Requires a valid admin token.
 */
async function fetchDashboardData() {
  const token = localStorage.getItem('adminToken')
  // Security Redirect: If no admin token is found, send user to login page
  if (!token) {
    router.push('/admin-login')
    return
  }

  try {
    // 1. Fetch Students List
    const resStudents = await fetch(`${API_BASE}/api/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (resStudents.ok) students.value = await resStudents.json()

    // 2. Fetch Global Certificate History
    const resCerts = await fetch(`${API_BASE}/api/certificates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (resCerts.ok) {
      const data = await resCerts.json()
      // Process each certificate to add tokenId and isRevoked
      for (const cert of data) {
        cert.tokenId = cert.nft?.token_id || cert.token_id || null
        cert.isRevoked = false
        cert.processing = false
        
        // Check revocation status
        if (cert.tokenId) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify/${cert.tokenId}`)
            if (verifyRes.ok) {
              const verifyData = await verifyRes.json()
              cert.isRevoked = verifyData.isRevoked || false
            }
          } catch (e) {
            console.error('Verify error:', e)
          }
        }
      }
      certificates.value = data
    }
  } catch (err) {
    console.error('Data fetch error:', err)
  }
}

/**
 * Show QR Code modal
 */
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

/**
 * Copy verification link
 */
async function copyVerificationLink(tokenId) {
  const link = `${window.location.origin}/verify/${tokenId}`
  try {
    await navigator.clipboard.writeText(link)
    alert('Verification link copied!')
  } catch {
    prompt('Copy this link:', link)
  }
}

/**
 * Toggle revocation status
 */
async function toggleRevocation(cert) {
  if (!cert.tokenId) return
  
  const action = cert.isRevoked ? 'reinstate' : 'revoke'
  const confirmed = confirm(`Are you sure you want to ${action} this certificate?`)
  
  if (!confirmed) return
  
  cert.processing = true
  
  try {
    const token = localStorage.getItem('adminToken')
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

/**
 * logout:
 * Clears administrative session and redirects to the public-facing admin login page.
 */
function logout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  router.push('/admin-login')
}

// Utility: Formats date strings into a localized readable format (e.g., MM/DD/YYYY)
function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

// Automatically fetch data when the component is mounted to the DOM
onMounted(fetchDashboardData)
</script>


<template>
  <div class="relative min-h-screen bg-transparent text-white flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-transparent border-r border-[#283039] hidden md:flex flex-col p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded-lg bg-indigo-500"></div>
        <h1 class="font-bold text-lg">Admin Panel</h1>
      </div>
      
      <nav class="flex-1 space-y-2">
        <button 
          @click="activeTab = 'dashboard'"
          :class="activeTab === 'dashboard' ? 'bg-[#283039] text-white' : 'text-gray-400 hover:bg-[#1b2127]'"
          class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition"
        >
          <span>📊</span> Overview
        </button>
        <button 
          @click="activeTab = 'issue'"
          :class="activeTab === 'issue' ? 'bg-[#283039] text-white' : 'text-gray-400 hover:bg-[#1b2127]'"
          class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition"
        >
          <span>✍️</span> Issue Certificate
        </button>
      </nav>

      <button @click="logout" class="flex items-center gap-3 px-4 py-3 mt-auto text-red-400 hover:text-red-300 transition">
        <span>🚪</span> Logout
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative overflow-y-auto">
      <header class="flex items-center justify-between px-8 py-5 border-b border-[#283039] bg-transparent sticky top-0 z-20">
        <h2 class="text-xl font-bold capitalize">{{ activeTab }}</h2>
        <button @click="fetchDashboardData" class="text-blue-400 hover:text-blue-300 text-sm">↻ Refresh</button>
      </header>

      <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <!-- DASHBOARD TAB -->
        <div v-if="activeTab === 'dashboard'" class="space-y-8">
          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-transparent border border-[#283039] rounded-2xl">
              <h3 class="text-gray-400 text-sm font-medium">Total Students</h3>
              <p class="text-3xl font-bold text-white mt-1">{{ totalStudents }}</p>
            </div>
            <div class="p-6 bg-transparent border border-[#283039] rounded-2xl">
              <h3 class="text-gray-400 text-sm font-medium">Certificates Issued</h3>
              <p class="text-3xl font-bold text-indigo-400 mt-1">{{ totalIssued }}</p>
            </div>
          </div>

          <!-- Recent Activity Table -->
          <div class="bg-transparent border border-[#283039] rounded-2xl overflow-hidden">
             <div class="px-6 py-4 border-b border-[#283039]">
               <h3 class="font-bold text-white">Recent Issues</h3>
             </div>
             <div class="overflow-x-auto">
               <table class="w-full text-left">
                 <thead class="bg-[#1b2127] text-gray-400 text-sm">
                   <tr>
                     <th class="px-6 py-3">Student</th>
                     <th class="px-6 py-3">Certificate</th>
                     <th class="px-6 py-3">Token ID</th>
                     <th class="px-6 py-3">Date</th>
                     <th class="px-6 py-3">Status</th>
                     <th class="px-6 py-3">Actions</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-[#283039]">
                   <tr v-for="cert in certificates" :key="cert.id" class="hover:bg-[#1b2127]/50 transition">
                     <td class="px-6 py-4 font-medium text-white">{{ cert.student?.full_name || cert.student_name || 'Unknown' }}</td>
                     <td class="px-6 py-4 text-gray-300">{{ cert.title }}</td>
                     <td class="px-6 py-4 font-mono text-gray-400">{{ cert.tokenId ? `#${cert.tokenId}` : 'N/A' }}</td>
                     <td class="px-6 py-4 text-gray-400">{{ formatDate(cert.issue_date || cert.created_at) }}</td>
                     <td class="px-6 py-4">
                       <span 
                         v-if="cert.tokenId"
                         class="px-2 py-1 rounded text-xs border"
                         :class="cert.isRevoked 
                           ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                           : 'bg-green-500/20 text-green-300 border-green-500/30'"
                       >
                         {{ cert.isRevoked ? 'Revoked' : 'Valid' }}
                       </span>
                       <span v-else class="text-gray-500 text-xs">Pending</span>
                     </td>
                     <td class="px-6 py-4">
                       <div class="flex gap-2">
                         <!-- View -->
                         <a 
                           v-if="cert.tokenId"
                           :href="`/verify/${cert.tokenId}`" 
                           target="_blank"
                           class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 border border-blue-400/30 rounded hover:bg-blue-500/10"
                         >
                           👁 View
                         </a>
                         <!-- QR -->
                         <button 
                           v-if="cert.tokenId"
                           @click="showQRCode(cert)"
                           class="text-purple-400 hover:text-purple-300 text-xs px-2 py-1 border border-purple-400/30 rounded hover:bg-purple-500/10"
                         >
                           📱 QR
                         </button>
                         <!-- Revoke/Reinstate -->
                         <button 
                           v-if="cert.tokenId"
                           @click="toggleRevocation(cert)"
                           :disabled="cert.processing"
                           class="text-xs px-2 py-1 border rounded transition-colors"
                           :class="cert.isRevoked 
                             ? 'text-green-400 border-green-400/30 hover:bg-green-500/10' 
                             : 'text-red-400 border-red-400/30 hover:bg-red-500/10'"
                         >
                           <span v-if="cert.processing">...</span>
                           <span v-else>{{ cert.isRevoked ? '✓ Reinstate' : '✗ Revoke' }}</span>
                         </button>
                       </div>
                     </td>
                   </tr>
                   <tr v-if="certificates.length === 0">
                     <td colspan="6" class="px-6 py-8 text-center text-gray-500">No certificates issued yet.</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <!-- ISSUE TAB -->
        <div v-if="activeTab === 'issue'">
          <CertificateIssuance />
        </div>

      </div>
    </main>

    <!-- QR Modal -->
    <div v-if="qrModal.show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="qrModal.show = false">
      <div class="bg-[#1b2127] p-6 rounded-xl border border-gray-700 max-w-sm">
        <h3 class="text-white text-lg font-bold mb-4 text-center">Verification QR Code</h3>
        <div v-if="qrModal.loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <div v-else>
          <a :href="`/verify/${qrModal.tokenId}`" target="_blank" class="block">
            <img v-if="qrModal.qrCode" :src="qrModal.qrCode" alt="QR Code" class="mx-auto rounded-lg mb-2 hover:opacity-90" />
          </a>
          <p class="text-gray-400 text-sm text-center mb-4">Token #{{ qrModal.tokenId }} - {{ qrModal.title }}</p>
          <div class="space-y-2">
            <a 
              :href="`/verify/${qrModal.tokenId}`"
              target="_blank"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
            >
              🔗 Open Verification Page
            </a>
            <button 
              @click="copyVerificationLink(qrModal.tokenId)"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
            >
              📋 Copy Link
            </button>
            <button 
              @click="qrModal.show = false"
              class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

