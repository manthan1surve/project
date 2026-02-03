<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const currentYear = new Date().getFullYear()

// Pages where we should hide footer (dashboard pages with their own layout)
const hideFooterPages = ['AdminDashboard', 'StudentDashboard', 'WalletDashboard']

const shouldShow = () => {
  return !hideFooterPages.includes(route.name)
}
</script>

<template>
  <footer v-if="shouldShow()" class="bg-[#0a0d10] border-t border-white/10 py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Main Footer Content -->
      <div class="grid md:grid-cols-4 gap-12 mb-12">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <img 
              src="/dcivs-logo.png" 
              alt="(formerly known as DCIVS)" 
              class="h-10 w-auto object-contain"
            />
          </div>
          <p class="text-gray-400 text-sm leading-relaxed mb-4">
            Decentralized Academic Achievement Registry and Integrity-Proof Platform. 
            Anchor achievement records on blockchain, enable independent integrity inspection.
          </p>
          <p class="text-gray-500 text-xs">
            ⚠️ This is a technical demonstration and does not claim institutional authority.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-bold text-white mb-4">Quick Links</h4>
          <ul class="space-y-3">
            <li>
              <router-link to="/" class="text-gray-400 hover:text-white text-sm transition-colors">
                Home
              </router-link>
            </li>
            <li>
              <router-link to="/login" class="text-gray-400 hover:text-white text-sm transition-colors">
                Student Login
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="text-gray-400 hover:text-white text-sm transition-colors">
                About Us
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Technical -->
        <div>
          <h4 class="font-bold text-white mb-4">Technology</h4>
          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-gray-400 text-sm">
              <span class="text-blue-400">⟠</span> Ethereum (ERC-721)
            </li>
            <li class="flex items-center gap-2 text-gray-400 text-sm">
              <span class="text-cyan-400">📦</span> IPFS Storage
            </li>
            <li class="flex items-center gap-2 text-gray-400 text-sm">
              <span class="text-green-400">💚</span> Vue.js 3
            </li>
            <li class="flex items-center gap-2 text-gray-400 text-sm">
              <span class="text-yellow-400">⚡</span> Node.js
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-gray-500 text-sm">
          © {{ currentYear }} (formerly known as DCIVS). Academic Project Demonstration.
        </p>
        <div class="flex items-center gap-6">
          <a href="https://github.com" target="_blank" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="https://ethereum.org" target="_blank" class="text-gray-400 hover:text-white transition-colors text-sm">
            Built on Ethereum
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
