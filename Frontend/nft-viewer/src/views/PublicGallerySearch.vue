<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
  email: '',
  password: '',
});

const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    router.push('/wallet');
  } catch (err) {
    error.value = err.message;
    console.error('Login error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="relative flex min-h-screen w-full items-center justify-center bg-[#111418]"
    style='font-family: "Spline Sans", "Noto Sans", sans-serif; width: 100vw;'
  >
    <div class="w-full max-w-md bg-[#1b2127] border border-[#3b4754] rounded-2xl shadow-2xl p-8">
      <h1 class="text-white text-2xl font-bold mb-2 text-center">Welcome</h1>
      <p class="text-gray-400 text-sm mb-6 text-center">
        Sign in with your email and password to access your wallet dashboard.
      </p>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm text-gray-300 mb-1" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-[#3b4754] bg-[#111418] h-12 placeholder:text-gray-500 px-4 text-base font-normal"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border border-[#3b4754] bg-[#111418] h-12 placeholder:text-gray-500 px-4 text-base font-normal"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="rounded-lg border border-red-500 bg-red-900/30 px-4 py-2 text-red-300 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Sign In</span>
          <span v-else>Signing in...</span>
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-400">
        Don’t have an account?
        <button
          type="button"
          class="text-sky-400 hover:text-sky-300 font-semibold"
          @click="router.push('/register')"
        >
          Create one
        </button>
      </div>
    </div>
  </div>
</template>

