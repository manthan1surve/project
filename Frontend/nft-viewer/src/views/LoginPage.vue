<template>
  <div class="min-h-screen bg-[#0d1117]">
    <AppHeader />
    
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <!-- Login Card -->
      <div class="relative z-10 w-full max-w-md px-4">
        <div class="glass-card p-8" data-particle-target="frame">
          <h1 class="text-3xl font-bold text-white text-center mb-2" data-particle-target="detail">Student Login</h1>
          <p class="text-gray-400 text-center mb-8">Access your academic wallet</p>

          <form @submit.prevent="handleLogin" class="space-y-6">
            
            <!-- Email -->
            <div>
              <label class="block text-sm text-gray-400 mb-1">Email</label>
              <input
                v-model="email"
                type="email"
                required
                class="input-glass"
                placeholder="student@university.edu"
                data-particle-target="detail"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm text-gray-400 mb-1">Password</label>
              <input
                v-model="password"
                type="password"
                required
                class="input-glass"
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
               <p class="text-sm text-gray-400">
                 Don't have an account? 
                 <router-link to="/register" class="text-indigo-400 hover:text-indigo-300">Register</router-link>
               </p>
               <p class="mt-2">
                 <router-link to="/view-gallery" class="text-xs text-gray-500 hover:text-gray-400">
                   Public Gallery Search
                 </router-link>
               </p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
.glass-card {
  @apply bg-transparent border border-white/10 rounded-3xl shadow-2xl relative z-10;
}

.input-glass {
  @apply w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all;
}

.btn-primary {
  @apply bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
