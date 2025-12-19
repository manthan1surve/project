<template>
  <div class="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
    <video
      class="absolute inset-0 w-full h-full object-cover z-0"
      autoplay
      muted
      loop
      playsinline
    >
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>

    <div class="absolute inset-0 bg-black/50 z-0"></div>

    <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full"></div>

    <div class="absolute top-10 right-6 z-20">
      <button @click="goToAdminLogin" class="admin-btn">
        Admin Login
      </button>
    </div>

    <div class="relative z-10 w-full max-w-4xl">
      <div class="glass-card overflow-hidden">
        <div class="md:flex">

          <div class="w-full p-8">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-xl md:text-2xl font-semibold text-white">
                Create Student Account
              </h1>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div class="md:col-span-2">
                  <label class="label">Full Name</label>
                  <input
                    v-model="formData.fullName"
                    required
                    type="text"
                    class="input-glass"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label class="label">Email</label>
                  <input
                    v-model="formData.email"
                    required
                    type="email"
                    class="input-glass"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label class="label">Password</label>
                  <input
                    v-model="formData.password"
                    required
                    type="password"
                    minlength="6"
                    class="input-glass"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label class="label">Student ID / Roll No</label>
                  <input
                    v-model="formData.rollNumber"
                    required
                    type="text"
                    class="input-glass"
                    placeholder="S123456"
                  />
                </div>

                <div>
                  <label class="label">Course Name</label>
                  <input
                    v-model="formData.courseName"
                    required
                    type="text"
                    class="input-glass"
                    placeholder="BSc IT"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="label">Year</label>
                  <select v-model="formData.year" class="input-glass" required>
                    <option value="" disabled class="text-black">Select Year</option>
                    <option value="FY" class="text-black">First Year (FY)</option>
                    <option value="SY" class="text-black">Second Year (SY)</option>
                    <option value="TY" class="text-black">Third Year (TY)</option>
                  </select>
                </div>

              </div>

              <div class="flex items-center justify-between gap-4 pt-2">
                <div class="flex gap-3 w-full">
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="btn-primary w-full flex justify-center"
                  >
                    {{ isLoading ? 'Registering...' : 'Register Student' }}
                  </button>
                </div>
              </div>

              <div class="text-center mt-4">
                 <p class="text-sm text-white/60">Already have an account? <router-link to="/login" class="text-indigo-300 hover:text-indigo-200">Login here</router-link></p>
              </div>

              <div v-if="successMessage" class="alert-success mt-4">
                {{ successMessage }}
              </div>

              <div v-if="errorMessage" class="alert-error mt-4">
                {{ errorMessage }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const formData = ref({
  fullName: '',
  email: '',
  password: '',
  rollNumber: '',
  courseName: '',
  year: ''
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

function goToAdminLogin() {
  router.push('/admin-login');
}

// THIS IS YOUR BACKEND LOGIC (from Stash)
async function handleRegister() {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // Note: I changed port to 3001 because that is what server.js is running on
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: formData.value.fullName,
        email: formData.value.email,
        password: formData.value.password,
        student_id_number: formData.value.rollNumber,
        course_name: formData.value.courseName,
        year: formData.value.year,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Save user info if needed

      successMessage.value = `Welcome, ${data.user.full_name}! Redirecting...`;

      setTimeout(() => {
        router.push('/student-dashboard'); // Redirect to Student Dashboard (Production Flow)
      }, 1000);

      // Clear form
      formData.value = {
        fullName: '',
        email: '',
        password: '',
        rollNumber: '',
        courseName: '',
        year: '',
      };
    } else {
      throw new Error(data.error || 'Registration failed.');
    }
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Glass Card (From Friend's Design) */
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
         placeholder-white/30
         transition-all
         focus:bg-white/20
         focus:ring-2 focus:ring-indigo-400;
}

/* Admin Button */
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

/* Primary Button */
.btn-primary {
  @apply px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500
         text-white font-medium transition disabled:opacity-50
         shadow-lg shadow-indigo-500/30;
}

/* Alerts */
.alert-success {
  @apply bg-emerald-500/20 border border-emerald-400/40
         text-emerald-200 p-3 rounded-xl text-center backdrop-blur-sm;
}

.alert-error {
  @apply bg-red-500/20 border border-red-400/40
         text-red-200 p-3 rounded-xl text-center backdrop-blur-sm;
}
</style>
