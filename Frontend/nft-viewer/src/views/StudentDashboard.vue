<template>
  <div class="h-full flex flex-col">
      <header class="flex items-center justify-between px-8 py-5 border-b border-transparent glass-header transition-colors duration-300">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white transition-colors">Welcome back, {{ student.full_name || 'Student' }}</h2>
        <div class="flex items-center gap-4">
          <!-- Theme Toggle -->
          <ThemeToggle />
          
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md"></div>
        </div>
      </header>

      <div class="p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Skeleton Profile -->
          <div v-if="loading" class="lg:col-span-2 p-6 glass-panel rounded-2xl flex items-center gap-6 transition-all duration-300">
             <SkeletonCard type="profile" class="w-full" />
          </div>

          <div v-else class="lg:col-span-2 p-6 glass-panel rounded-2xl flex items-center gap-6 transition-all duration-300">
            <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl shadow-inner">
              🎓
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{{ student.full_name || 'Loading...' }}</h3>
              <p class="text-gray-500 dark:text-gray-400 mt-1 transition-colors">{{ student.email }}</p>
              <div class="flex gap-3 mt-4">
                <span class="px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#283039] text-xs font-mono text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-medium transition-colors">
                  ID: {{ student.student_id_number || '---' }}
                </span>
                <span class="px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#283039] text-xs font-mono text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-medium transition-colors">
                  Active Student
                </span>
              </div>
            </div>
          </div>

          <!-- Skeleton Details -->
          <div v-if="loading" class="p-6 glass-panel rounded-2xl flex flex-col justify-center transition-all duration-300">
             <SkeletonCard type="text" />
          </div>

          <div v-else class="p-6 glass-panel rounded-2xl flex flex-col justify-center transition-all duration-300">
             <h4 class="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Academic Details</h4>
             <div class="space-y-3">
               <div class="flex justify-between border-b border-gray-100 dark:border-[#283039] pb-2 transition-colors">
                 <span class="text-gray-500 dark:text-gray-400">Course</span>
                 <span class="font-medium text-gray-900 dark:text-white transition-colors">{{ student.course_name || '---' }}</span>
               </div>
               <div class="flex justify-between border-b border-gray-100 dark:border-[#283039] pb-2 transition-colors">
                 <span class="text-gray-500 dark:text-gray-400">Year</span>
                 <span class="font-medium text-gray-900 dark:text-white transition-colors">{{ student.year || '---' }}</span>
               </div>
               <div class="flex justify-between">
                 <span class="text-gray-500 dark:text-gray-400">Semester</span>
                 <span class="font-medium text-gray-900 dark:text-white transition-colors">Current</span>
               </div>
             </div>
          </div>
        </section>

        <!-- Actions -->
        <section>
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white transition-colors">Quick Actions</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button @click="$router.push('/student/wallet')" class="group p-6 glass-card rounded-2xl text-left transition-all">
              <div class="w-12 h-12 rounded-lg bg-indigo-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                📜
              </div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white transition-colors">View Achievements</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 transition-colors">Access your blockchain-anchored records.</p>
            </button>
            
          </div>
        </section>

      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'
import SkeletonCard from '../components/ui/SkeletonCard.vue'

const router = useRouter()
const student = ref({})
const loading = ref(true)

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
  } finally {
    loading.value = false
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(fetchProfile)
</script>
