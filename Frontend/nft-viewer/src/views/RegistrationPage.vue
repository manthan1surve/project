<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
    <SignedOut>
      <div class="flex items-center justify-center h-screen">
        <SignIn />
      </div>
    </SignedOut>

    <SignedIn>
      <div class="max-w-3xl mx-auto">
        <div class="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <div class="md:flex">
            <!-- Left panel (illustration + title) -->
            <div class="hidden md:flex md:w-1/3 bg-linear-to-br from-indigo-600 to-indigo-500 text-white p-8 flex-col justify-center">
              <h2 class="text-2xl font-semibold mb-2">Register New Student</h2>
              <p class="text-sm opacity-90">Add student details and link their Ethereum address for on-chain certificate issuance.</p>

              <div class="mt-6">
                <!-- Simple decorative SVG -->
                <svg class="w-28 h-28 opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="0.5"/>
                </svg>
              </div>
            </div>

            <!-- Form panel -->
            <div class="w-full md:w-2/3 p-8">
              <div class="flex items-center justify-between">
                <h1 class="text-xl md:text-2xl font-bold text-slate-800">Register Student</h1>
                <div v-if="successMessage" class="text-sm text-green-700">Saved</div>
              </div>

              <form @submit.prevent="handleRegister" class="mt-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="fullName" class="block text-sm font-medium text-slate-600">Full Name</label>
                    <input v-model="formData.fullName" id="fullName" type="text" required
                           class="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>

                  <div>
                    <label for="studentId" class="block text-sm font-medium text-slate-600">Student ID</label>
                    <input v-model="formData.studentId" id="studentId" type="text" required
                           class="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>

                  <div>
                    <label for="courseName" class="block text-sm font-medium text-slate-600">Course</label>
                    <input v-model="formData.courseName" id="courseName" type="text" required
                           class="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>

                  <div>
                    <label for="year" class="block text-sm font-medium text-slate-600">Year</label>
                    <select v-model="formData.year" id="year" required
                            class="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option>FY</option>
                      <option>SY</option>
                      <option>TY</option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label for="ethAddress" class="block text-sm font-medium text-slate-600">Ethereum Address</label>
                    <input v-model="formData.ethAddress" id="ethAddress" type="text" required placeholder="0x..."
                           class="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center space-x-3">
                    <button type="submit" :disabled="isLoading"
                            class="inline-flex items-center gap-3 rounded-lg px-5 py-2.5 bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-opacity="0.3" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                      </svg>

                      <span v-if="!isLoading">Register Student</span>
                      <span v-else>Registering...</span>
                    </button>

                    <button type="button" @click="resetForm" class="rounded-lg px-4 py-2 border border-slate-200 text-sm">Reset</button>
                  </div>

                  <div class="text-sm text-slate-500">All fields are required.</div>
                </div>

                <div>
                  <div v-if="successMessage" class="rounded-md bg-green-50 border border-green-100 p-3 text-green-800">{{ successMessage }}</div>
                  <div v-if="errorMessage" class="rounded-md bg-red-50 border border-red-100 p-3 text-red-800">{{ errorMessage }}</div>
                </div>
              </form>

              <div class="mt-6 text-xs text-slate-400">Tip: Use a valid Ethereum address (0x... ). The backend should verify and store the address securely.</div>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { SignIn, SignedIn, SignedOut } from '@clerk/vue';

const formData = ref({
  fullName: '',
  studentId: '',
  courseName: 'Computer Science',
  year: 'FY',
  ethAddress: '',
});

const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

function resetForm() {
  formData.value = { fullName: '', studentId: '', courseName: 'Computer Science', year: 'FY', ethAddress: '' };
  successMessage.value = '';
  errorMessage.value = '';
}

async function handleRegister() {
  // Basic client-side validation (example)
  if (!/^0x[a-fA-F0-9]{40}$/.test(formData.value.ethAddress)) {
    errorMessage.value = 'Please enter a valid Ethereum address.';
    return;
  }

  isLoading.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const response = await fetch('http://localhost:3000/api/register-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value),
    });

    const data = await response.json();

    if (response.ok) {
      successMessage.value = `Student "${data.student.full_name}" registered successfully!`;
      resetForm();
    } else {
      throw new Error(data.error || 'Registration failed.');
    }
  } catch (err) {
    errorMessage.value = err.message || String(err);
    console.error('Registration error:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>
