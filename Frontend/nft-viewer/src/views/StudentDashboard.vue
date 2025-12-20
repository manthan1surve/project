<template>
  <div class="relative min-h-screen bg-transparent text-white flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-transparent border-r border-[#283039] hidden md:flex flex-col p-6" data-particle-target="frame">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded-full bg-indigo-500"></div>
        <h1 class="font-bold text-lg">Student Portal</h1>
      </div>
      
      <nav class="flex-1 space-y-2">
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#283039] text-white font-medium" data-particle-target="detail">
          <span>🏠</span> Dashboard
        </a>
        <a href="/wallet" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[#1b2127] transition" data-particle-target="detail">
          <span>🎓</span> My Certificates
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[#1b2127] transition">
          <span>⚙️</span> Settings
        </a>
      </nav>

      <button @click="logout" class="flex items-center gap-3 px-4 py-3 mt-auto text-red-400 hover:text-red-300 transition">
        <span>🚪</span> Logout
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative overflow-y-auto">
      <!-- Top Bar -->
      <header class="flex items-center justify-between px-8 py-5 border-b border-[#283039] bg-transparent sticky top-0 z-20" data-particle-target="frame">
        <h2 class="text-xl font-bold">Welcome back, {{ student.full_name || 'Student' }}</h2>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
        </div>
      </header>

      <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <!-- Profile Card -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 p-6 bg-transparent border border-[#283039] rounded-2xl flex items-center gap-6 shadow-xl" data-particle-target="detail">
            <div class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
              🎓
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white">{{ student.full_name || 'Loading...' }}</h3>
              <p class="text-gray-400 mt-1">{{ student.email }}</p>
              <div class="flex gap-3 mt-4">
                <span class="px-3 py-1 rounded-full bg-[#283039] text-xs font-mono text-indigo-300 border border-indigo-500/30">
                  ID: {{ student.student_id_number || '---' }}
                </span>
                <span class="px-3 py-1 rounded-full bg-[#283039] text-xs font-mono text-emerald-300 border border-emerald-500/30">
                  Active Student
                </span>
              </div>
            </div>
          </div>

          <div class="p-6 bg-transparent border border-[#283039] rounded-2xl flex flex-col justify-center shadow-xl" data-particle-target="detail">
             <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Academic Details</h4>
             <div class="space-y-3">
               <div class="flex justify-between border-b border-[#283039] pb-2">
                 <span class="text-gray-400">Course</span>
                 <span class="font-medium text-white">{{ student.course_name || '---' }}</span>
               </div>
               <div class="flex justify-between border-b border-[#283039] pb-2">
                 <span class="text-gray-400">Year</span>
                 <span class="font-medium text-white">{{ student.year || '---' }}</span>
               </div>
               <div class="flex justify-between">
                 <span class="text-gray-400">Semester</span>
                 <span class="font-medium text-white">Current</span>
               </div>
             </div>
          </div>
        </section>

        <!-- Actions -->
        <section>
          <h3 class="text-xl font-bold mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button @click="$router.push('/wallet')" class="group p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl hover:border-indigo-400 transition-all text-left" data-particle-target="detail">
              <div class="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                📜
              </div>
              <h4 class="text-lg font-bold text-white">View Certificates</h4>
              <p class="text-sm text-gray-400 mt-2">Access your blockchain-verified credentials.</p>
            </button>
            
            <div class="p-6 bg-transparent border border-[#283039] rounded-2xl opacity-50 cursor-not-allowed" data-particle-target="detail">
              <div class="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center mb-4">
                📚
              </div>
              <h4 class="text-lg font-bold text-white">Course Materials</h4>
              <p class="text-sm text-gray-400 mt-2">Download syllabus and notes (Coming Soon).</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const student = ref({})

async function fetchProfile() {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const res = await fetch('http://localhost:3001/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      student.value = await res.json()
    } else {
      localStorage.removeItem('token')
      router.push('/login')
    }
  } catch (err) {
    console.error('Profile fetch error:', err)
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(fetchProfile)
</script>
