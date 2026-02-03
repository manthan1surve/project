<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
    <AppHeader />
    
    <div class="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden pt-20">
      <!-- CONTENT -->
      <div class="relative z-10 w-full max-w-sm px-4">
        <div class="card mx-auto w-full overflow-hidden" data-particle-target="frame">
          <!-- HEADER -->
          <div class="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/10 bg-transparent text-center transition-colors">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <span class="text-2xl">🏛️</span>
            </div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-slate-50 transition-colors">
              Institution Login
            </h1>
            <p class="text-xs text-gray-500 dark:text-slate-300 mt-1 transition-colors">
              Registry administrator access
            </p>
          </div>

          <!-- FORM -->
          <form
            @submit.prevent="handleAdminLogin"
            class="px-6 py-5 space-y-5"
          >
            <!-- Email -->
            <label class="field-label">
              <span class="field-title">Email</span>
              <input
                v-model="email"
                type="email"
                required
                class="input-base"
                placeholder="admin@institution.edu"
              />
            </label>

            <!-- Password -->
            <label class="field-label">
              <span class="field-title">Password</span>
              <input
                v-model="password"
                type="password"
                required
                class="input-base"
                placeholder="Enter password"
              />
            </label>

            <!-- ACTION -->
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary w-full"
            >
              {{ isLoading ? 'Logging in...' : 'Login as Admin' }}
            </button>
          </form>

          <!-- MESSAGES -->
          <div class="px-6 pb-4">
            <div v-if="errorMessage" class="alert-error text-center">
              {{ errorMessage }}
            </div>
          </div>
        </div>
        
        <!-- Back to home -->
        <div class="text-center mt-6">
          <router-link to="/" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
            ← Back to Home
          </router-link>
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
      credentials: 'include' // Important for cookies
    })
    const data = await res.json()
    csrfToken.value = data.csrfToken
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err)
  }
})

async function handleAdminLogin() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken.value // Include CSRF header
      },
      credentials: 'include', // Send cookies (including CSRF cookie)
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')

    // Save Admin Token
    localStorage.setItem('adminToken', data.token)
    localStorage.setItem('adminUser', JSON.stringify(data.user))

    // Redirect to admin dashboard
    router.push('/admin-dashboard')

  } catch (err) {
    errorMessage.value = err.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped>
/* CARD */
.card {
  @apply rounded-3xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl transition-all duration-300;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.1);
}
.dark .card {
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.3);
}

/* FORM */
.field-label {
  display: flex;
  flex-direction: column;
}

.field-title {
  @apply text-[11px] text-gray-500 dark:text-gray-300 mb-1 font-medium uppercase tracking-wide transition-colors;
}

.input-base {
  @apply rounded-xl px-4 py-2.5 text-sm leading-relaxed text-gray-900 dark:text-slate-50 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-white/30;
}

.input-base:focus {
  @apply bg-white dark:bg-indigo-500/10 border-indigo-400 dark:border-indigo-400/50 ring-2 ring-indigo-500/20;
}

/* BUTTON */
.btn-primary {
  @apply rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-indigo-500/30;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ALERT */
.alert-error {
  @apply text-[13px] text-red-600 dark:text-red-200 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100 dark:border-red-500/20 transition-colors;
}
</style>
