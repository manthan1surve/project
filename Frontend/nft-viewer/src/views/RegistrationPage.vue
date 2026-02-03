<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
    <AppHeader />
    
    <div class="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20">
      <!-- Background decorations (Dark only) -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full opacity-0 dark:opacity-100 transition-opacity"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-500/20 blur-3xl rounded-full opacity-0 dark:opacity-100 transition-opacity"></div>

      <div class="relative z-10 w-full max-w-4xl">
        <div class="auth-card overflow-hidden" data-particle-target="frame">
          <div class="md:flex">
            <div class="w-full p-8">
              <div class="flex items-center justify-between mb-6">
                <h1 class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white transition-colors" data-particle-target="detail">
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
                      class="input-field"
                      placeholder="John Doe"
                      data-particle-target="detail"
                    />
                    <span class="text-[10px] text-gray-500 dark:text-white/40 block mt-1 italic ml-1">Example: FirstName MiddleName Surname</span>
                  </div>

                  <div>
                    <label class="label">Email</label>
                    <input
                      v-model="formData.email"
                      required
                      type="email"
                      class="input-field"
                      placeholder="john@example.com"
                      data-particle-target="detail"
                    />
                  </div>

                  <div>
                    <label class="label">Password</label>
                    <input
                      v-model="formData.password"
                      required
                      type="password"
                      minlength="6"
                      class="input-field"
                      placeholder="••••••••"
                      data-particle-target="detail"
                    />
                  </div>

                  <div>
                    <label class="label">Student ID / Roll No</label>
                    <input
                      v-model="formData.rollNumber"
                      required
                      type="text"
                      class="input-field"
                      placeholder="e.g. 25tbscit006"
                      data-particle-target="detail"
                    />
                    <span class="text-[10px] text-gray-500 dark:text-white/40 block mt-1 italic ml-1 leading-tight">Format: [Year][FY/SY/TY][Dept][RollNo]</span>
                  </div>

                  <div>
                    <label class="label">Course Name</label>
                    <input
                      v-model="formData.courseName"
                      required
                      type="text"
                      class="input-field"
                      placeholder="BSc IT"
                      data-particle-target="detail"
                    />
                    <span class="text-[10px] text-gray-500 dark:text-white/40 block mt-1 italic ml-1">Default prefilled as BSCIT</span>
                  </div>

                  <div class="md:col-span-2">
                    <label class="label">Year</label>
                    <select v-model="formData.year" class="input-field cursor-pointer" required data-particle-target="detail">
                      <option value="" disabled>Select Year</option>
                      <option value="FY">First Year (FY)</option>
                      <option value="SY">Second Year (SY)</option>
                      <option value="TY">Third Year (TY)</option>
                    </select>
                  </div>

                </div>

                <div class="flex items-center justify-between gap-4 pt-2">
                  <div class="flex gap-3 w-full">
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="btn-primary w-full flex justify-center"
                      data-particle-target="detail"
                    >
                      {{ isLoading ? 'Registering...' : 'Register Student' }}
                    </button>
                  </div>
                </div>

                <div class="text-center mt-4">
                   <p class="text-sm text-gray-600 dark:text-gray-400">Already have an account? <router-link to="/login" class="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium">Login here</router-link></p>
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
    
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

const router = useRouter();

const formData = ref({
  fullName: '',
  email: '',
  password: '',
  rollNumber: '',
  courseName: 'BSCIT',
  year: ''
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const csrfToken = ref('');

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

async function handleRegister() {
  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken.value
      },
      credentials: 'include',
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
      localStorage.setItem('user', JSON.stringify(data.user));

      successMessage.value = `Welcome, ${data.user.full_name}! Redirecting...`;

      setTimeout(() => {
        router.push('/student-dashboard');
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
/* Auth Card */
.auth-card {
  @apply bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 rounded-3xl shadow-xl dark:shadow-2xl relative z-10 transition-all duration-300;
}

/* Labels */
.label {
  @apply block text-sm text-gray-700 dark:text-white/70 mb-1 font-medium transition-colors;
}

/* Inputs */
.input-field {
  @apply w-full rounded-lg
         bg-white dark:bg-transparent
         text-gray-900 dark:text-white
         px-4 py-2
         border border-gray-300 dark:border-white/20
         outline-none
         placeholder-gray-400 dark:placeholder-white/30
         transition-all
         focus:bg-gray-50 dark:focus:bg-white/20
         focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
         focus:border-transparent;
}

/* Primary Button */
.btn-primary {
  @apply px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500
         text-white font-medium transition disabled:opacity-50
         shadow-lg shadow-indigo-500/30;
}

/* Alerts */
.alert-success {
  @apply bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/40
         text-emerald-800 dark:text-emerald-200 p-3 rounded-xl text-center backdrop-blur-sm shadow-sm;
}

.alert-error {
  @apply bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-400/40
         text-red-800 dark:text-red-200 p-3 rounded-xl text-center backdrop-blur-sm shadow-sm;
}
</style>
