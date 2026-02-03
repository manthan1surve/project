<template>
  <div class="h-full flex flex-col">
      <header class="flex items-center justify-between px-8 py-5 border-b border-transparent glass-header transition-colors duration-300">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white transition-colors">Settings & Preferences</h2>
        <div class="flex items-center gap-4">
          <ThemeToggle />
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md"></div>
        </div>
      </header>

      <div class="p-8 max-w-5xl mx-auto w-full space-y-8">
        
        <!-- Tabs -->
        <div class="flex gap-4 border-b dark:border-[#30363d] border-gray-200 pb-1">
          <button 
            @click="activeTab = 'profile'"
            :class="[
              'px-4 py-2 font-medium text-sm transition-colors relative',
              activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            Profile
            <div v-if="activeTab === 'profile'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></div>
          </button>
          
          <button 
            @click="activeTab = 'security'"
            :class="[
              'px-4 py-2 font-medium text-sm transition-colors relative',
              activeTab === 'security' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            Security
            <div v-if="activeTab === 'security'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></div>
          </button>

          <button 
            @click="activeTab = 'appearance'"
            :class="[
              'px-4 py-2 font-medium text-sm transition-colors relative',
              activeTab === 'appearance' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            Appearance
            <div v-if="activeTab === 'appearance'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></div>
          </button>
        </div>

        <!-- PROFILE TAB -->
        <section v-if="activeTab === 'profile'" class="animate-fade-in">
           <div class="bg-white dark:bg-[#161b22] border dark:border-[#30363d] border-gray-200 rounded-2xl p-8 shadow-sm">
             <div class="flex items-center gap-6 mb-8">
               <div class="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold shadow-xl">
                 {{ userInitials }}
               </div>
               <div>
                 <h3 class="text-2xl font-bold">{{ user?.full_name || 'Student' }}</h3>
                 <p class="text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
                 <span class="inline-block mt-2 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                   Active Student
                 </span>
               </div>
             </div>

             <div class="grid md:grid-cols-2 gap-6">
               <div class="p-4 bg-gray-50 dark:bg-[#0d1117] rounded-xl border dark:border-[#30363d] border-gray-200">
                 <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</label>
                 <p class="font-mono text-lg mt-1">{{ user?.student_id_number || 'N/A' }}</p>
               </div>
               <div class="p-4 bg-gray-50 dark:bg-[#0d1117] rounded-xl border dark:border-[#30363d] border-gray-200">
                 <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Address</label>
                 <p class="font-mono text-sm mt-1 truncate" :title="user?.ethereum_address">{{ user?.ethereum_address || 'Not Connected' }}</p>
               </div>
             </div>
           </div>
        </section>

        <!-- SECURITY TAB -->
        <section v-if="activeTab === 'security'" class="animate-fade-in">
          <div class="bg-white dark:bg-[#161b22] border dark:border-[#30363d] border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
              🔒 Change Password
            </h3>

            <!-- Reuse logic from previous implementation -->
            <form @submit.prevent="handleChangePassword" class="space-y-6 max-w-lg">
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input 
                  v-model="form.oldPassword"
                  type="password" 
                  required
                  class="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-white"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input 
                  v-model="form.newPassword"
                  type="password" 
                  required
                  minlength="6"
                  class="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-white"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input 
                  v-model="form.confirmPassword"
                  type="password" 
                  required
                  minlength="6"
                  class="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-white"
                  placeholder="Re-enter new password"
                />
              </div>

              <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                ⚠️ {{ error }}
              </div>
              
              <div v-if="success" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl text-green-600 dark:text-green-400 text-sm">
                ✅ {{ success }}
              </div>

              <button 
                type="submit" 
                :disabled="isLoading"
                class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {{ isLoading ? 'Updating...' : 'Update Password' }}
              </button>
            </form>
          </div>
        </section>

        <!-- APPEARANCE TAB -->
        <section v-if="activeTab === 'appearance'" class="animate-fade-in">
          <div class="bg-white dark:bg-[#161b22] border dark:border-[#30363d] border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 class="text-xl font-bold mb-6">🎨 Interface Theme</h3>
            
            <div class="flex gap-6">
              <button 
                @click="setTheme(false)"
                class="flex-1 p-6 border-2 rounded-2xl transition-all relative overflow-hidden group text-center"
                :class="!isDark ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500/50'"
              >
                <div class="w-16 h-16 mx-auto bg-white rounded-full shadow-md flex items-center justify-center text-3xl mb-4 text-orange-400 border border-gray-100">
                  ☀️
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white">Light Mode</h4>
                <p class="text-sm text-gray-500 mt-2">Clean, crisp, and bright.</p>
                <div v-if="!isDark" class="absolute top-4 right-4 text-indigo-500">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                </div>
              </button>

              <button 
                @click="setTheme(true)"
                class="flex-1 p-6 border-2 rounded-2xl transition-all relative overflow-hidden group text-center"
                :class="isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500/50'"
              >
                <div class="w-16 h-16 mx-auto bg-[#0d1117] rounded-full shadow-md flex items-center justify-center text-3xl mb-4 text-indigo-400 border border-gray-700">
                  🌙
                </div>
                <h4 class="font-bold text-gray-900 dark:text-white">Dark Mode</h4>
                <p class="text-sm text-gray-500 mt-2">Sleek, immersive, and easy on eyes.</p>
                <div v-if="isDark" class="absolute top-4 right-4 text-indigo-500">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                </div>
              </button>
            </div>

            <div class="mt-8 p-4 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-xl text-sm flex gap-3">
              <span>💡</span>
              <p>Your theme preference is saved automatically and will persist across all pages.</p>
            </div>
          </div>
        </section>

      </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { isDark, toggleTheme } from '../services/theme'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const activeTab = ref('profile') // Default tab
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// Computed
const userInitials = computed(() => {
  const name = user.value.full_name || 'Student'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

// Theme Handling
function setTheme(dark) {
  if (isDark.value !== dark) {
    toggleTheme()
  }
}

// Password Form State
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

// Fetch fresh user data on mount
onMounted(async () => {
    const token = localStorage.getItem('token')
    if (token) {
        try {
            const res = await fetch('http://localhost:3001/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                user.value = data
                localStorage.setItem('user', JSON.stringify(data))
            }
        } catch (e) {
            console.error(e)
        }
    }
})

async function handleChangePassword() {
  error.value = ''
  success.value = ''

  if (form.newPassword !== form.confirmPassword) {
    error.value = "New passwords do not match."
    return
  }

  if (form.newPassword.length < 6) {
    error.value = "Password must be at least 6 characters."
    return
  }

  isLoading.value = true

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch('http://localhost:3001/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update password')
    }

    success.value = "Password updated successfully!"
    
    // Clear form
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''

  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Simple fade animation for tab switching */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
