  <template>
    <div class="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <!-- Background Video -->
  <video
    class="absolute inset-0 w-full h-full object-cover z-0"
    autoplay
    muted
    loop
    playsinline
  >
    <source src="/bg-video.mp4" type="video/mp4" />
  </video>

  <!-- Dark overlay for contrast -->
  <div class="absolute inset-0 bg-black/50 z-0"></div>


      <!-- Glow blobs -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
      <!-- Admin Login -->
  <div class="absolute top-10 right-6 z-20">
    <button
      @click="goToAdminLogin"
      class="admin-btn"
    >
      Admin Login
    </button>
  </div>


      <SignedOut>
        <div class="relative z-10">
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <div class="relative z-10 w-full max-w-4xl">
          <!-- Glass Card -->
          <div class="glass-card overflow-hidden">
            <div class="md:flex">
              <!-- Right Panel -->
              <div class="w-full p-8">
                <div class="flex items-center justify-between mb-6">
                  <h1 class="text-xl md:text-2xl font-semibold text-white">
                    Student Registration
                  </h1>
                  <span v-if="successMessage" class="text-sm text-emerald-300">
                    Saved
                  </span>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="label">Full Name</label>
                      <input
                        v-model="formData.fullName"
                        required
                        class="input-glass"
                      />
                    </div>

                    <div>
                      <label class="label">Student ID</label>
                      <input
                        v-model="formData.rollno"
                        required
                        class="input-glass"
                      />
                    </div>

                    <div>
                      <label class="label">Course</label>
                      <input
                        v-model="formData.courseName"
                        required
                        class="input-glass"
                      />
                    </div>

                    <div>
                      <label class="label">Year</label>
                      <select v-model="formData.year" class="input-glass">
                        <option>FY</option>
                        <option>SY</option>
                        <option>TY</option>
                      </select>
                    </div>
                  </div>

                  <div class="flex items-center justify-between gap-4 pt-2">
                    <div class="flex gap-3">
                      <button
                        type="submit"
                        :disabled="isLoading"
                        class="btn-primary"
                      >
                        {{ isLoading ? 'Registering…' : 'Register Student' }}
                      </button>

                      <button
                        type="button"
                        @click="resetForm"
                        class="btn-secondary"
                      >
                        Reset
                      </button>
                    </div>

                    <span class="text-xs text-white/60">
                      All fields required
                    </span>
                  </div>

                  <div v-if="successMessage" class="alert-success">
                    {{ successMessage }}
                  </div>

                  <div v-if="errorMessage" class="alert-error">
                    {{ errorMessage }}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  </template>

  <script setup>
import { ref } from 'vue'
import { SignIn, SignedIn, SignedOut } from '@clerk/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  fullName: 'Manthan Surve',
  rollno: '25TBSCIT062',
  courseName: 'Information Technology',
  year: 'TY'
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function resetForm() {
  formData.value = {
    fullName: '',
    rollno: '',
    courseName: '',
    year: ''
  }
  successMessage.value = ''
  errorMessage.value = ''
}

/* ✅ ADMIN LOGIN ROUTE (MUST BE TOP-LEVEL) */
function goToAdminLogin() {
  router.push('/admin-login')
}

async function handleRegister() {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Fake API delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    const dummyStudent = {
      fullName: formData.value.fullName,
      rollno: formData.value.rollno,
      courseName: formData.value.courseName,
      year: formData.value.year,
      registeredAt: new Date().toISOString()
    }

    localStorage.setItem('student', JSON.stringify(dummyStudent))

    successMessage.value = 'Student registered successfully'
    resetForm()

    router.push('/student-dashboard')
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>


  <style scoped>
  /* Glass Card */
  .glass-card {
    @apply bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl;
  }

  /* Labels */
  .label {
    @apply block text-sm text-white/70 mb-1;
  }

  /* Glass Inputs */
  .input-glass {
    @apply w-full rounded-lg
          bg-white/10 backdrop-blur-md
          text-white
          px-4 py-2
          border border-white/20
          outline-none
          focus:ring-2 focus:ring-indigo-400;
  }
  .admin-btn {
  @apply px-4 py-2 rounded-lg
         bg-black/40 backdrop-blur-md
         border border-white/20
         text-white text-sm font-medium
         shadow-lg
         hover:bg-white/20
         hover:border-white/40
         transition;
}


  /* Buttons */
  .btn-primary {
    @apply px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
          text-white font-medium transition disabled:opacity-50;
  }

  .btn-secondary {
    @apply px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20
          text-white transition;
  }

  /* Alerts */
  .alert-success {
    @apply bg-emerald-500/20 border border-emerald-400/40
          text-emerald-200 p-4 rounded-xl;
  }

  .alert-error {
    @apply bg-red-500/20 border border-red-400/40
          text-red-200 p-4 rounded-xl;
  }
  </style>
