<script setup>
import { ref, reactive, onMounted, computed } from 'vue' // Vue composition API utilities
import { useRouter } from 'vue-router' // Router for page navigation
import CertificateIssuance from '../components/admincomponents/CertificateIssuance.vue' // Custom component for certificate issuance form
import BatchOperations from '../components/admincomponents/BatchOperations.vue' // Batch CSV operations
import { isDark, toggleTheme } from '../services/theme'
import ThemeToggle from '../components/ThemeToggle.vue'
import ParticleBackground2 from '../components/ParticleBackground2.vue'

// Initialize router instance
const router = useRouter()
// State to track the currently selected tab in the UI
const activeTab = ref('dashboard')
// Reactive arrays to hold fetched data
const students = ref([])
const certificates = ref([])
const logs = ref([])

// QR Modal state
const qrModal = reactive({
  show: false,
  loading: false,
  qrCode: null,
  tokenId: null,
  title: ''
})

// Settings State
const settingsForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const settingsState = reactive({
  loading: false,
  error: '',
  success: ''
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
    
    // 3. Fetch Activity Logs
    fetchLogs()
    
  } catch (err) {
    console.error('Data fetch error:', err)
  }
}

async function fetchLogs() {
  const token = localStorage.getItem('adminToken')
  if (!token) return

  try {
    const res = await fetch(`${API_BASE}/api/admin/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      logs.value = await res.json()
    }
  } catch (err) {
    console.error('Logs fetch error:', err)
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
 * Change Admin Password
 */
async function changeAdminPassword() {
  settingsState.error = ''
  settingsState.success = ''

  if (settingsForm.newPassword !== settingsForm.confirmPassword) {
    settingsState.error = "New passwords do not match."
    return
  }

  settingsState.loading = true
  try {
    const token = localStorage.getItem('adminToken')
    const res = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
         oldPassword: settingsForm.oldPassword,
         newPassword: settingsForm.newPassword
      })
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update password')
    
    settingsState.success = 'Password updated successfully'
    settingsForm.oldPassword = ''
    settingsForm.newPassword = ''
    settingsForm.confirmPassword = ''
  } catch (e) {
    settingsState.error = e.message
  } finally {
    settingsState.loading = false
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

// Theme Helper
function setTheme(dark) {
  if (isDark.value !== dark) toggleTheme()
}
</script>


<template>
  <div class="relative min-h-screen bg-transparent dark:bg-transparent dark:text-white text-gray-900 flex overflow-hidden transition-colors duration-300">
    <ParticleBackground2 />
    <!-- Sidebar -->
    <aside class="w-64 glass-sidebar hidden md:flex flex-col p-6 relative z-30">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/30"></div>
        <h1 class="font-bold text-lg">Admin Panel</h1>
      </div>
      
      <nav class="flex-1 space-y-2">
        <button 
          v-for="tab in ['dashboard', 'issue', 'batch', 'logs', 'settings']"
          :key="tab"
          @click="activeTab = tab"
          :class="activeTab === tab 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1b2127]'"
          class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all"
        >
          <span v-if="tab === 'dashboard'">📊</span>
          <span v-else-if="tab === 'issue'">✍️</span>
          <span v-else-if="tab === 'batch'">📤</span>
          <span v-else-if="tab === 'logs'">📜</span>
          <span v-else-if="tab === 'settings'">⚙️</span>
          <span class="capitalize">{{ tab === 'issue' ? 'Register Record' : tab === 'batch' ? 'Batch Operations' : tab === 'logs' ? 'Activity Logs' : tab }}</span>
        </button>
      </nav>

      <button @click="logout" class="flex items-center gap-3 px-4 py-3 mt-auto text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 rounded-xl font-medium">
        <span>🚪</span> Logout
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative overflow-y-auto">
      <header class="flex items-center justify-between px-8 py-5 border-b border-transparent glass-header sticky top-0 z-20">
        <h2 class="text-xl font-bold capitalize">{{ activeTab === 'issue' ? 'Register Record' : activeTab }}</h2>
        <div class="flex items-center gap-4">
          <ThemeToggle />
          <button @click="fetchDashboardData" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">↻ Refresh</button>
        </div>
      </header>

      <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <!-- DASHBOARD TAB -->
        <div v-if="activeTab === 'dashboard'" class="space-y-8 animate-fade-in">
          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 glass-panel rounded-2xl shadow-sm">
              <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Students</h3>
              <p class="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{{ totalStudents }}</p>
            </div>
            <div class="p-6 glass-panel rounded-2xl shadow-sm">
              <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Records Anchored</h3>
              <p class="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mt-1">{{ totalIssued }}</p>
            </div>
          </div>

          <!-- Recent Activity Table -->
          <div class="glass-panel rounded-2xl overflow-hidden shadow-sm">
             <div class="px-6 py-4 border-b border-transparent">
               <h3 class="font-bold text-gray-900 dark:text-white">Recent Registrations</h3>
             </div>
             <div class="overflow-x-auto">
               <table class="w-full text-left">
                 <thead class="bg-gray-50 dark:bg-[#1b2127] text-gray-500 dark:text-gray-400 text-sm">
                   <tr>
                     <th class="px-6 py-3">Student</th>
                     <th class="px-6 py-3">Achievement</th>
                     <th class="px-6 py-3">Token ID</th>
                     <th class="px-6 py-3">Date</th>
                     <th class="px-6 py-3">Status</th>
                     <th class="px-6 py-3">Actions</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-gray-200 dark:divide-[#283039]">
                   <tr v-for="cert in certificates" :key="cert.id" class="hover:bg-gray-50 dark:hover:bg-[#1b2127]/50 transition">
                     <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ cert.student?.full_name || cert.student_name || 'Unknown' }}</td>
                     <td class="px-6 py-4 text-gray-600 dark:text-gray-300">{{ cert.title }}</td>
                     <td class="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">{{ cert.tokenId ? `#${cert.tokenId}` : 'N/A' }}</td>
                     <td class="px-6 py-4 text-gray-500 dark:text-gray-400">{{ formatDate(cert.issue_date || cert.created_at) }}</td>
                     <td class="px-6 py-4">
                       <span 
                         v-if="cert.tokenId"
                         class="px-2 py-1 rounded text-xs border font-medium"
                         :class="cert.isRevoked 
                           ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/30' 
                           : 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/30'"
                       >
                         {{ cert.isRevoked ? 'Revoked' : 'Valid' }}
                       </span>
                       <span v-else class="text-gray-400 dark:text-gray-500 text-xs">Pending</span>
                     </td>
                     <td class="px-6 py-4">
                       <div class="flex gap-2">
                         <!-- View -->
                         <a 
                           v-if="cert.tokenId"
                           :href="`/verify/${cert.tokenId}`" 
                           target="_blank"
                           class="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-xs px-2 py-1 border border-blue-200 dark:border-blue-400/30 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"
                         >
                           👁 View
                         </a>
                         <!-- QR -->
                         <button 
                           v-if="cert.tokenId"
                           @click="showQRCode(cert)"
                           class="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 text-xs px-2 py-1 border border-purple-200 dark:border-purple-400/30 rounded hover:bg-purple-50 dark:hover:bg-purple-500/10"
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
                             ? 'text-green-500 dark:text-green-400 border-green-200 dark:border-green-400/30 hover:bg-green-50 dark:hover:bg-green-500/10' 
                             : 'text-red-500 dark:text-red-400 border-red-200 dark:border-red-400/30 hover:bg-red-50 dark:hover:bg-red-500/10'"
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
        <div v-if="activeTab === 'issue'" class="animate-fade-in">
          <CertificateIssuance />
        </div>

        <!-- BATCH OPERATIONS TAB -->
        <div v-if="activeTab === 'batch'" class="animate-fade-in">
          <BatchOperations />
        </div>

        <!-- ACTIVITY LOGS TAB -->
        <div v-if="activeTab === 'logs'" class="space-y-6 animate-fade-in">
          <div class="bg-white dark:bg-[#1b2127] border border-gray-200 dark:border-[#283039] rounded-2xl overflow-hidden shadow-sm">
             <div class="px-6 py-4 border-b border-gray-200 dark:border-[#283039] flex justify-between items-center">
               <h3 class="font-bold text-gray-900 dark:text-white">System Activity Log</h3>
               <button @click="fetchLogs" class="text-xs bg-gray-100 dark:bg-[#283039] hover:bg-gray-200 dark:hover:bg-[#30363d] px-3 py-1 rounded transition text-gray-600 dark:text-gray-300">Refresh</button>
             </div>
             <div class="overflow-x-auto">
               <table class="w-full text-left">
                 <thead class="bg-gray-50 dark:bg-[#21262d] text-gray-500 dark:text-gray-400 text-sm">
                   <tr>
                     <th class="px-6 py-3">Timestamp</th>
                     <th class="px-6 py-3">User</th>
                     <th class="px-6 py-3">Action</th>
                     <th class="px-6 py-3">Details</th>
                     <th class="px-6 py-3">IP Address</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-gray-200 dark:divide-[#283039]">
                   <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-[#283039]/50 transition text-sm">
                     <td class="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ new Date(log.timestamp).toLocaleString() }}</td>
                     <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ log.user }}</td>
                     <td class="px-6 py-4">
                       <span class="px-2 py-1 rounded text-xs border font-mono font-medium"
                         :class="{
                           'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500/30': log.action.includes('LOGIN'),
                           'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500/30': log.action.includes('MINT') || log.action.includes('ISSUE'),
                           'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/30': log.action.includes('REGISTER'),
                           'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/30': log.action.includes('REVOKE'),
                           'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600': !log.action.includes('LOGIN') && !log.action.includes('MINT') && !log.action.includes('REGISTER')
                         }"
                       >
                         {{ log.action }}
                       </span>
                     </td>
                     <td class="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" :title="log.details">{{ log.details }}</td>
                     <td class="px-6 py-4 font-mono text-gray-500 dark:text-gray-500 text-xs">{{ log.ip_address }}</td>
                   </tr>
                   <tr v-if="logs.length === 0">
                     <td colspan="5" class="px-6 py-8 text-center text-gray-500">No activity recorded yet.</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <!-- SETTINGS TAB -->
        <div v-if="activeTab === 'settings'" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
           
           <!-- Appearance -->
           <div class="glass-panel rounded-2xl p-6 shadow-sm">
             <h3 class="font-bold text-gray-900 dark:text-white mb-6">🎨 Appearance</h3>
             <div class="grid grid-cols-2 gap-4">
                <button 
                @click="setTheme(false)"
                class="p-4 border rounded-xl transition-all text-center hover:bg-gray-50"
                :class="!isDark ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-[#30363d] text-gray-500 dark:text-gray-400'"
              >
                <div class="text-2xl mb-2">☀️</div>
                <div class="font-bold text-sm">Light Mode</div>
              </button>
              <button 
                @click="setTheme(true)"
                class="p-4 border rounded-xl transition-all text-center hover:bg-[#283039]"
                :class="isDark ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-2 ring-500/20' : 'border-gray-200 dark:border-[#30363d] text-gray-500 dark:text-gray-400'"
              >
                <div class="text-2xl mb-2">🌙</div>
                <div class="font-bold text-sm">Dark Mode</div>
              </button>
             </div>
           </div>

           <!-- Security -->
           <div class="glass-panel rounded-2xl p-6 shadow-sm">
             <h3 class="font-bold text-gray-900 dark:text-white mb-6">🔒 Security</h3>
             <form @submit.prevent="changeAdminPassword" class="space-y-4">
               <div>
                  <label class="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                  <input v-model="settingsForm.oldPassword" type="password" required class="w-full mt-1 glass-input rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="••••••••" />
               </div>
               <div>
                  <label class="text-xs font-bold text-gray-500 uppercase">New Password</label>
                  <input v-model="settingsForm.newPassword" type="password" required minlength="6" class="w-full mt-1 glass-input rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" placeholder="••••••••" />
               </div>
               <div>
                  <label class="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                  <input v-model="settingsForm.confirmPassword" type="password" required minlength="6" class="w-full mt-1 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
               </div>
               
               <div v-if="settingsState.error" class="text-red-500 text-xs bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-500/30">{{ settingsState.error }}</div>
               <div v-if="settingsState.success" class="text-green-500 text-xs bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-200 dark:border-green-500/30">{{ settingsState.success }}</div>

               <button type="submit" :disabled="settingsState.loading" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm transition disabled:opacity-50">
                 {{ settingsState.loading ? 'Updating...' : 'Update Password' }}
               </button>
             </form>
           </div>
        </div>

      </div>
    </main>

    <!-- QR Modal -->
    <div v-if="qrModal.show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="qrModal.show = false">
      <div class="bg-white dark:bg-[#1b2127] p-6 rounded-xl border border-gray-200 dark:border-gray-700 max-w-sm w-full shadow-2xl">
        <h3 class="text-gray-900 dark:text-white text-lg font-bold mb-4 text-center">Inspection QR Code</h3>
        <div v-if="qrModal.loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <div v-else>
          <a :href="`/verify/${qrModal.tokenId}`" target="_blank" class="block">
            <img v-if="qrModal.qrCode" :src="qrModal.qrCode" alt="QR Code" class="mx-auto rounded-lg mb-2 hover:opacity-90" />
          </a>
          <p class="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">Token #{{ qrModal.tokenId }} - {{ qrModal.title }}</p>
          <div class="space-y-2">
            <a 
              :href="`/verify/${qrModal.tokenId}`"
              target="_blank"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
            >
              🔗 Open Inspection Page
            </a>
            <button 
              @click="copyVerificationLink(qrModal.tokenId)"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
            >
              📋 Copy Link
            </button>
            <button 
              @click="qrModal.show = false"
              class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
