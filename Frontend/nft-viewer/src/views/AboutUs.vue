<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white transition-colors duration-300">
    <AppHeader />
    
    <main class="pt-24 pb-16 px-4">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 transition-colors">
            About The Team
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
            Building the future of academic verification at KC College.
          </p>
        </div>

        <!-- Project Info -->
        <div class="p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] mb-12 relative overflow-hidden shadow-lg dark:shadow-none transition-all duration-300">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          
          <h2 class="text-2xl font-bold mb-4 relative z-10 text-gray-900 dark:text-white transition-colors">Project Vision</h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10 transition-colors">
            This Decentralized Certificate Verification System (formerly known as DCIVS) was developed as a final year project to combat academic fraud and empower students with true ownership of their achievements. By leveraging Ethereum and IPFS, we created a tamper-proof infrastructure that eliminates the need for manual verification.
          </p>

          <div class="mt-8 flex flex-wrap gap-4 relative z-10">
            <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">KC College</span>
            <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium">Final Year Project (TY)</span>
            <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-500/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium">2025-2026</span>
          </div>
        </div>

        <!-- Developers -->
        <h2 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white transition-colors">Meet the Developers</h2>
        <div class="grid md:grid-cols-2 gap-8 mb-16">
          
          <!-- Harshwardhan -->
          <div class="p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-blue-500/50 transition-all group shadow-lg dark:shadow-none">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6 mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
              HC
            </div>
            <div class="text-center">
              <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">Harshwardhan Chauhan</h3>
              <p class="text-blue-600 dark:text-blue-400 text-sm mb-4 transition-colors">Student of TY BScIT</p>
              <div class="flex justify-center gap-4">
                 <a href="mailto:harsh15022003@gmail.com" class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                   📧 harsh15022003@gmail.com
                 </a>
              </div>
            </div>
          </div>

          <!-- Manthan -->
          <div class="p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] hover:border-purple-500/50 transition-all group shadow-lg dark:shadow-none">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
              MS
            </div>
            <div class="text-center">
              <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">Manthan Surve</h3>
              <p class="text-purple-600 dark:text-purple-400 text-sm mb-4 transition-colors">Student of TY BScIT</p>
              <div class="flex justify-center gap-4">
                 <span class="text-gray-500 dark:text-gray-400 transition-colors">
                   🛠️ Full Stack Engineer
                 </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
</script>

<style scoped>
/* No scoped styles needed - using Tailwind utility classes for theme support */
</style>
