<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isDark, toggleTheme } from '../services/theme'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()

const isScrolled = ref(false)
const showStudentDropdown = ref(false)
const mobileMenuOpen = ref(false)

// Pages where we should hide the full header (they have their own nav)
const minimalHeaderPages = ['AdminDashboard', 'StudentDashboard', 'WalletDashboard']

const isMinimalHeader = () => {
  return minimalHeaderPages.includes(route.name)
}

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function closeDropdown() {
  showStudentDropdown.value = false
}

function toggleMobile() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <header 
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/90 dark:bg-[#0d1117]/95 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 py-3 shadow-sm dark:shadow-none' : 'bg-transparent py-5'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center group">
        <img 
          src="/dcivs-logo.png" 
          alt="(formerly known as DCIVS)" 
          class="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
        />
      </router-link>

      <!-- Desktop Navigation Removed -->
      <!-- <nav class="hidden md:flex items-center gap-6"> ... </nav> -->

      <!-- Action Buttons -->
      <div class="hidden md:flex items-center gap-3">
        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Student Dropdown -->
        <div class="relative">
          <button 
            @click="showStudentDropdown = !showStudentDropdown"
            @blur="setTimeout(() => closeDropdown(), 150)"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="isScrolled ? 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200' : 'bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 text-gray-900 dark:text-white backdrop-blur-sm'"
          >
            <span>👤 Student</span>
            <svg 
              :class="['w-4 h-4 transition-transform', showStudentDropdown ? 'rotate-180' : '']" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Dropdown Menu -->
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
          >
            <div 
              v-if="showStudentDropdown"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1b2127] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
            >
              <router-link 
                to="/login" 
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-colors"
                @click="closeDropdown"
              >
                <span>🔑</span> Login
              </router-link>
              <router-link 
                to="/register" 
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-colors border-t border-gray-100 dark:border-white/5"
                @click="closeDropdown"
              >
                <span>✍️</span> Register
              </router-link>
              <router-link 
                to="/wallet" 
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-colors border-t border-gray-100 dark:border-white/5"
                @click="closeDropdown"
              >
                <span>💼</span> My Wallet
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Admin Login Button -->
        <router-link 
          to="/admin-login"
          class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
        >
          🏛️ Admin Login
        </router-link>
      </div>

      <!-- Mobile Menu Button -->
      <button 
        @click="toggleMobile"
        class="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div 
        v-if="mobileMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-[#0d1117]/98 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 shadow-xl"
      >
        <nav class="px-4 py-4 space-y-2">
          <div class="flex justify-between items-center px-4 mb-2">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Menu</span>
            <ThemeToggle />
          </div>
          
          <router-link 
            to="/login" 
            class="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            🔑 Student Login
          </router-link>
          <router-link 
            to="/register" 
            class="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            ✍️ Student Register
          </router-link>
          <router-link 
            to="/wallet" 
            class="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            💼 My Wallet
          </router-link>
          
          <div class="border-t border-gray-200 dark:border-white/10 my-3"></div>
          
          <router-link 
            to="/admin-login"
            class="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg text-center shadow-md"
            @click="mobileMenuOpen = false"
          >
            🏛️ Admin Login
          </router-link>
        </nav>
      </div>
    </transition>
  </header>
</template>
