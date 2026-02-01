<template>
  <div class="min-h-screen bg-[#0d1117]">
    <AppHeader />
    
    <div class="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden pt-20">
      <!-- CONTENT -->
      <div class="relative z-10 w-full max-w-sm px-4">
        <div class="card mx-auto w-full overflow-hidden" data-particle-target="frame">
          <!-- HEADER -->
          <div class="px-6 pt-5 pb-4 border-b border-white/10 bg-transparent text-center">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span class="text-2xl">🏛️</span>
            </div>
            <h1 class="text-xl font-semibold text-slate-50">
              Institution Login
            </h1>
            <p class="text-xs text-slate-300 mt-1">
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
          <router-link to="/" class="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back to Home
          </router-link>
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

async function handleAdminLogin() {
  errorMessage.value = ''
  isLoading.value = true

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
/* GLASS CARD */
.card {
  border-radius: 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.3);
}

/* FORM */
.field-label {
  display: flex;
  flex-direction: column;
}

.field-title {
  font-size: 11px;
  color: #d1d5db;
  margin-bottom: 4px;
}

.input-base {
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.4;

  color: #f8fafc;
  caret-color: #a5b4fc;

  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
}

.input-base::placeholder {
  color: rgba(224, 231, 255, 0.6);
}

.input-base:focus {
  background: rgba(99, 102, 241, 0.18);
  border-color: rgba(165, 180, 252, 0.9);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35);
}

/* BUTTON */
.btn-primary {
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 14px;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  transition: all 0.2s;
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
  font-size: 13px;
  color: #fecaca;
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}
</style>
