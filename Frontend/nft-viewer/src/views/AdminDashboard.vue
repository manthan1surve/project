<script setup>
import { ref, onMounted, computed } from 'vue' // Vue composition API utilities
import { useRouter } from 'vue-router' // Router for page navigation
import CertificateIssuance from '../components/admincomponents/CertificateIssuance.vue' // Custom component for certificate issuance form

// Initialize router instance
const router = useRouter()
// State to track the currently selected tab in the UI
const activeTab = ref('dashboard')
// Reactive arrays to hold fetched data
const students = ref([])
const certificates = ref([])

// Computed properties for dashboard summary statistics
const totalStudents = computed(() => students.value.length)
const totalIssued = computed(() => certificates.value.length)

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
    const resStudents = await fetch('http://localhost:3001/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (resStudents.ok) students.value = await resStudents.json()

    // 2. Fetch Global Certificate History
    const resCerts = await fetch('http://localhost:3001/api/certificates', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (resCerts.ok) certificates.value = await resCerts.json()
  } catch (err) {
    console.error('Data fetch error:', err)
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
             <table class="w-full text-left">
               <thead class="bg-[#1b2127] text-gray-400 text-sm">
                 <tr>
                   <th class="px-6 py-3">Student</th>
                   <th class="px-6 py-3">Certificate</th>
                   <th class="px-6 py-3">Date</th>
                   <th class="px-6 py-3">Status</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-[#283039]">
                 <tr v-for="cert in certificates" :key="cert.id" class="hover:bg-[#1b2127]/50 transition">
                   <td class="px-6 py-4 font-medium text-white">{{ cert.student_name }}</td>
                   <td class="px-6 py-4 text-gray-300">{{ cert.title }}</td>
                   <td class="px-6 py-4 text-gray-400">{{ formatDate(cert.created_at) }}</td>
                   <td class="px-6 py-4">
                     <span class="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs border border-green-500/30">Minted</span>
                   </td>
                 </tr>
                 <tr v-if="certificates.length === 0">
                   <td colspan="4" class="px-6 py-8 text-center text-gray-500">No certificates issued yet.</td>
                 </tr>
               </tbody>
             </table>
          </div>
        </div>

        <!-- ISSUE TAB -->
        <div v-if="activeTab === 'issue'">
          <CertificateIssuance />
        </div>

      </div>
    </main>
  </div>
</template>
