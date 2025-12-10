<template>
  <!-- Fullscreen layout -->
  <div
    class="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-x-hidden"
  >
    <!-- Vibrant gradient background -->
  <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 via-slate-900 to-green-700" />


    <!-- Glow blobs / depth -->
    <div class="pointer-events-none absolute -left-40 -top-40 h-72 w-72 rounded-full bg-fuchsia-500/40 blur-3xl" />
    <div class="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-cyan-400/40 blur-3xl" />
    <div class="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/10" />

    <!-- Content -->
    <div class="relative z-10 w-full max-w-6xl px-4">
      <!-- Signed out -->
      <SignedOut>
        <div class="w-full flex justify-center">
          <SignIn />
        </div>
      </SignedOut>

      <!-- Signed in -->
      <SignedIn>
        <!-- GLASS CARD (no fixed aspect, no drag) -->
        <div
          class="card mx-auto w-full max-w-6xl overflow-hidden"
        >
          <!-- inner content so flex-centering from .card doesn't break layout -->
          <div class="relative z-10 flex flex-col h-full w-full overflow-hidden">
            <!-- Header -->
            <div
              class="px-8 pt-7 pb-4 border-b border-white/10
                     flex items-start justify-between gap-4 bg-white/5"
            >
              <div>
                <div
                  class="inline-flex items-center gap-2 rounded-full
                         bg-indigo-500/10 text-indigo-100
                         px-3 py-1 text-xs font-medium mb-3
                         ring-1 ring-indigo-300/40"
                >
                  <span
                    class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                  ></span>
                  New registration
                </div>
                <h1
                  class="text-2xl md:text-3xl font-semibold text-slate-50 drop-shadow-sm"
                >
                  Register New Student
                </h1>
                <p class="text-sm text-slate-200/70 mt-1">
                  Enter the student details and link their Ethereum address to your certificate system.
                </p>
              </div>

              <div
                class="hidden md:flex flex-col items-end text-xs text-slate-200/70"
              >
                <span class="uppercase tracking-[0.2em] text-[10px]">Status</span>
                <span
                  class="mt-1 inline-flex items-center gap-1 rounded-full
                         bg-emerald-400/10 text-emerald-100 px-2.5 py-1
                         ring-1 ring-emerald-300/40"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"></span>
                  Ready
                </span>
              </div>
            </div>

            <!-- Form -->
            <form
              @submit.prevent="handleRegister"
              class="px-8 py-6 space-y-6"
            >
              <!-- Top info row -->
              <div
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <p class="text-xs text-slate-200/70">
                  <span class="font-semibold text-slate-50">Step 1:</span>
                  Fill in the student’s profile and Ethereum address.
                </p>

                <div
                  class="flex items-center gap-3 text-xs text-slate-300/70"
                >
                  <span
                    class="hidden md:inline-block h-px w-10 bg-white/15"
                  ></span>
                  <span>All fields are required</span>
                </div>
              </div>

              <!-- Inputs -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label class="field-label">
                  <span class="field-title">Full name</span>
                  <input
                    v-model="formData.fullName"
                    id="fullName"
                    type="text"
                    required
                    class="input-base"
                    placeholder="e.g. Priya Sharma"
                  />
                </label>

                <label class="field-label">
                  <span class="field-title">Student ID</span>
                  <input
                    v-model="formData.studentId"
                    id="studentId"
                    type="text"
                    required
                    class="input-base"
                    placeholder="e.g. KC2025-001"
                  />
                </label>

                <label class="field-label">
                  <span class="field-title">Course</span>
                  <input
                    v-model="formData.courseName"
                    id="courseName"
                    type="text"
                    required
                    class="input-base"
                    placeholder="Computer Science"
                  />
                </label>

                <label class="field-label">
                  <span class="field-title">Year</span>
                  <div class="relative">
                    <select
                      v-model="formData.year"
                      id="year"
                      required
                      class="input-base appearance-none pr-9 cursor-pointer"
                    >
                      <option>FY</option>
                      <option>SY</option>
                      <option>TY</option>
                    </select>
                    <span
                      class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300/80"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.268l3.71-4.037a.75.75 0 111.08 1.04l-4.25 4.625a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </label>

                <label class="field-label md:col-span-2">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="field-title">Ethereum address</span>
                    <span class="text-[11px] text-slate-300/70">
                      0x + 40 hex characters
                    </span>
                  </div>
                  <div class="relative">
                    <input
                      v-model="formData.ethAddress"
                      id="ethAddress"
                      type="text"
                      required
                      placeholder="0x..."
                      class="input-base pl-10"
                    />
                    <span
                      class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300/80"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 3L5 12.5L12 21L19 12.5L12 3Z"
                          stroke="currentColor"
                          stroke-width="1.4"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M12 8V13L8.5 11.2M12 13L15.5 11.2"
                          stroke="currentColor"
                          stroke-width="1.4"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <p v-if="formErrors.eth" class="mt-1 text-xs text-red-300">
                    {{ formErrors.eth }}
                  </p>
                </label>
              </div>

              <!-- Footer actions -->
              <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3
                       border-t border-white/10"
              >
                <div class="flex items-center gap-3">
                  <button
                    type="submit"
                    :disabled="isLoading || !isFormValid"
                    class="btn-primary"
                  >
                    <svg
                      v-if="isLoading"
                      xmlns="http://www.w3.org/2000/svg"
                      class="animate-spin h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>

                    <span>{{ isLoading ? 'Registering...' : 'Register Student' }}</span>
                  </button>

                  <button type="button" @click="resetForm" class="btn-secondary">
                    Reset
                  </button>
                </div>

                <!-- Preview chip -->
                <div
                  class="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-200/80"
                >
                  <span class="font-medium text-slate-50">Preview:</span>
                  <div
                    class="inline-flex items-center gap-2 rounded-full
                           bg-white/5 px-3 py-1.5 border border-white/20
                           backdrop-blur-xl text-[11px] md:text-xs"
                  >
                    <span class="font-medium">
                      {{ formData.fullName || '—' }}
                    </span>
                    <span class="text-slate-400">•</span>
                    <span>{{ formData.studentId || '—' }}</span>
                    <span class="hidden sm:inline text-slate-500">•</span>
                    <span class="hidden sm:inline text-slate-200/80">
                      {{ formData.year || 'Year' }} • {{ formData.courseName || 'Course' }}
                    </span>
                  </div>
                </div>
              </div>
            </form>

            <!-- Messages -->
            <div class="px-8 pb-6">
              <div v-if="successMessage" class="alert-success mt-2">
                {{ successMessage }}
              </div>
              <div v-if="errorMessage" class="alert-error mt-2">
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>

    <!-- SVG filter for displacement (kept for the glass effect) -->
    <svg style="display:none;">
      <filter id="displacementFilter">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.01"
          numOctaves="2"
          result="turbulence"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="200"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
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
const formErrors = ref({ eth: '' });

const isEthAddressValid = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());

const isFormValid = computed(() => {
  if (!formData.value.fullName || !formData.value.studentId || !formData.value.courseName) return false;
  if (!isEthAddressValid(formData.value.ethAddress)) return false;
  return true;
});

function resetForm() {
  formData.value = {
    fullName: '',
    studentId: '',
    courseName: 'Computer Science',
    year: 'FY',
    ethAddress: '',
  };
  successMessage.value = '';
  errorMessage.value = '';
  formErrors.value.eth = '';
}

async function handleRegister() {
  successMessage.value = '';
  errorMessage.value = '';
  formErrors.value.eth = '';

  if (!isEthAddressValid(formData.value.ethAddress)) {
    formErrors.value.eth = 'Please enter a valid Ethereum address (0x + 40 hex characters).';
    return;
  }

  isLoading.value = true;

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
    errorMessage.value = err.message || 'Network error';
    console.error('Registration error:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* ========= GLASS CARD ========= */
.card {
  position: relative;
  display: flex;
  border-radius: 32px;

  /* semi-transparent dark base, no color change */
  background: rgba(15, 23, 42, 0.65);

  /* frosted effect */
  backdrop-filter: blur(26px) saturate(180%);
  -webkit-backdrop-filter: blur(26px) saturate(180%);

  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.9),
    inset 0 0 0.8px rgba(255, 255, 255, 0.25);
}

/* Soft internal glass glow */
.card::before {
  content: "";
  position: absolute;
  inset: -20%;
  border-radius: inherit;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.22), transparent 55%),
    radial-gradient(circle at 90% 70%, rgba(255, 255, 255, 0.12), transparent 65%);
  opacity: 0.55;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

/* Sheen / reflection on top */
.card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.16),
    transparent
  );
  pointer-events: none;
  mix-blend-mode: screen;
}

/* ========= FORM + CONTROLS ========= */
.field-label {
  @apply flex flex-col;
}

.field-title {
  @apply text-xs font-medium text-slate-100 mb-1.5 tracking-wide;
}

.input-base {
  @apply w-full rounded-2xl px-3.5 py-2.5 text-sm
  border border-white/25
  bg-white/5 text-slate-50
  shadow-[0_10px_30px_rgba(15,23,42,0.55)]
  focus:outline-none focus:ring-2 focus:ring-indigo-300/70 focus:border-indigo-200
  placeholder:text-slate-300/60
  backdrop-blur-xl transition;
}

.btn-primary {
  @apply inline-flex items-center justify-center gap-2
  rounded-2xl px-4 py-2.5 text-sm font-medium
  bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-500
  shadow-[0_18px_45px_rgba(79,70,229,0.65)]
  text-white
  hover:from-indigo-300 hover:via-indigo-400 hover:to-violet-400
  active:scale-[0.97]
  disabled:opacity-60 disabled:cursor-not-allowed
  transition-transform duration-150;
}

.btn-secondary {
  @apply inline-flex items-center justify-center gap-2
  rounded-2xl px-3.5 py-2.5 text-xs font-medium
  border border-white/25
  bg-white/5 text-slate-50
  hover:bg-white/10
  backdrop-blur-xl transition;
}

.alert-success {
  @apply bg-emerald-400/15 border border-emerald-300/50
  text-emerald-100 px-4 py-3 rounded-2xl text-sm flex items-start gap-2
  backdrop-blur-xl;
}

.alert-error {
  @apply bg-red-400/15 border border-red-300/50
  text-red-100 px-4 py-3 rounded-2xl text-sm flex items-start gap-2
  backdrop-blur-xl;
}
</style>
