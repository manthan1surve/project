<template>
  <!-- ROOT -->
  <div
    class="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden"
  >
    <!-- VIDEO BACKGROUND -->
    <video
      class="absolute inset-0 w-full h-full object-cover"
      autoplay
      muted
      loop
      playsinline
    >
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>

    <!-- DARK OVERLAY -->
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- CONTENT -->
    <div class="relative z-10 w-full max-w-sm px-4">
      <div class="card mx-auto w-full overflow-hidden">
        <!-- HEADER -->
        <div class="px-6 pt-5 pb-4 border-b border-white/10 bg-white/5 text-center">
          <h1 class="text-xl font-semibold text-slate-50">
            Admin Login
          </h1>
          <p class="text-xs text-slate-300 mt-1">
            Authorized access only
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
              placeholder="admin@example.com"
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleAdminLogin() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    /* ===============================
       🔴 ORIGINAL LOGIN LOGIC (COMMENTED)
       =============================== */

    /*
    const res = await fetch('http://localhost:5173', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    */

    /* ===============================
       🟢 DUMMY ADMIN LOGIN
       =============================== */

    // Fake delay to simulate API
    await new Promise(resolve => setTimeout(resolve, 900))

    // Hardcoded credentials
    if (
      email.value !== 'admin@example.com' ||
      password.value !== 'admin123'
    ) {
      throw new Error('Invalid admin credentials')
    }

    // Optional: mark admin session
    localStorage.setItem(
      'admin',
      JSON.stringify({
        email: email.value,
        role: 'admin',
        loggedInAt: new Date().toISOString()
      })
    )

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
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(24px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.85);
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

  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(129, 140, 248, 0.35);
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
}

/* ALERT */
.alert-error {
  font-size: 13px;
  color: #fecaca;
}
</style>
