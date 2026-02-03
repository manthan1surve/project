<template>
  <div class="relative min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white flex overflow-hidden transition-colors duration-300">
    <!-- Persistent Background -->
    <ParticleBackground2 />

    <!-- Persistent Sidebar -->
    <aside class="w-64 glass-sidebar hidden md:flex flex-col p-6 transition-all duration-300 relative z-30">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm"></div>
        <h1 class="font-bold text-lg text-gray-800 dark:text-white transition-colors">Student Portal</h1>
      </div>
      
      <nav class="flex-1 space-y-2">
        <router-link 
          to="/student/dashboard" 
          class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1b2127] hover:text-gray-900 dark:hover:text-white transition-all text-gray-500 dark:text-gray-400" 
          active-class="bg-gray-100 dark:bg-[#283039] text-gray-900 dark:text-white shadow-sm font-medium"
        >
          <span>🏠</span> Dashboard
        </router-link>
        <router-link 
          to="/student/wallet" 
          class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1b2127] hover:text-gray-900 dark:hover:text-white transition-all text-gray-500 dark:text-gray-400" 
          active-class="bg-gray-100 dark:bg-[#283039] text-gray-900 dark:text-white shadow-sm font-medium"
        >
          <span>🎓</span> My Achievements
        </router-link>
        <router-link 
          to="/student/settings" 
          class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1b2127] hover:text-gray-900 dark:hover:text-white transition-all text-gray-500 dark:text-gray-400" 
          active-class="bg-gray-100 dark:bg-[#283039] text-gray-900 dark:text-white shadow-sm font-medium"
        >
          <span>⚙️</span> Settings
        </router-link>
      </nav>

      <button @click="logout" class="flex items-center gap-3 px-4 py-3 mt-auto text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
        <span>🚪</span> Logout
      </button>
    </aside>

    <!-- Main Content Area (Changes smoothly) -->
    <main class="flex-1 flex flex-col relative overflow-y-auto w-full">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ParticleBackground2 from '../ParticleBackground2.vue'

const router = useRouter()

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
