<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
    <AppHeader />
    
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <!-- Background Decorations (Dark Mode Only) -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
        <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      </div>

      <!-- Login Card -->
      <div class="relative z-10 w-full max-w-md px-4">
        <div class="auth-card" data-particle-target="frame">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2 transition-colors" data-particle-target="detail">Student Login</h1>
          <p class="text-gray-600 dark:text-gray-400 text-center mb-8 transition-colors">Access your academic wallet</p>

          <form @submit.prevent="handleLogin" class="space-y-6">
            
            <!-- Email -->
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="input-field"
                placeholder="student@university.edu"
                data-particle-target="detail"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors">Password</label>
              <input
                v-model="password"
                type="password"
                required
                class="input-field"
                placeholder="••••••••"
                data-particle-target="detail"
              />
            </div>

            <!-- Action -->
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary w-full"
              data-particle-target="detail"
            >
              {{ isLoading ? 'Logging in...' : 'Sign In' }}
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-6 text-center">
               <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                 Don't have an account? 
                 <router-link to="/register" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">Register</router-link>
               </p>
               <p class="mt-2">
                 <router-link to="/view-gallery" class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                   Public Gallery Search
                 </router-link>
               </p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-200 text-sm text-center transition-colors">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const csrfToken = ref('')

// Fetch CSRF token on mount
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/csrf-token', {
      credentials: 'include'
    })
    const data = await res.json()
    csrfToken.value = data.csrfToken
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err)
  }
})

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken.value
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (res.ok) {
      // Login Success
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      // Redirect to Student Dashboard
      router.push('/student-dashboard')
    } else {
      throw new Error(data.error || 'Login failed')
    }
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  @apply bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-2xl relative z-10 p-8 transition-all duration-300;
}

.input-field {
  @apply w-full bg-white dark:bg-transparent border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all;
}

.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
