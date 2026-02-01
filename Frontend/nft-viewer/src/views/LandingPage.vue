<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()

// Scroll animation state
const sections = ref([])
const visibleSections = ref(new Set())

// Features data
const features = [
  {
    icon: '🔗',
    title: 'Blockchain Anchored',
    description: 'Credential records are anchored as NFTs on Ethereum blockchain, creating immutable, timestamped references that cannot be altered.'
  },
  {
    icon: '🌐',
    title: 'Decentralized Storage',
    description: 'Files are stored on IPFS, ensuring permanent availability without relying on centralized servers.'
  },
  {
    icon: '🔍',
    title: 'Public Inspection',
    description: 'Anyone can independently inspect record integrity using cryptographic proof - no institutional contact required.'
  },
  {
    icon: '📱',
    title: 'QR Code Sharing',
    description: 'Share credentials instantly via QR codes. Inspectors can verify authenticity with a simple scan.'
  },
  {
    icon: '🔐',
    title: 'Student-Controlled',
    description: 'Students hold NFT references in their own blockchain wallets, giving them true ownership of their credential records.'
  },
  {
    icon: '📊',
    title: 'Status Signaling',
    description: 'Institutions can update record status on-chain, providing transparent lifecycle management.'
  }
]

// Stats
const stats = [
  { value: '100%', label: 'Immutable Records' },
  { value: '<2s', label: 'Inspection Time' },
  { value: '∞', label: 'Storage Duration' },
  { value: '0', label: 'Central Points of Failure' }
]

// Intersection Observer for scroll animations
let observer = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSections.value.add(entry.target.dataset.section)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

  // Observe all animated sections
  document.querySelectorAll('[data-section]').forEach(el => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

function isVisible(sectionId) {
  return visibleSections.value.has(sectionId)
}
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] text-white">
    <AppHeader />
    
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
      <!-- Colorful background glows -->
      <div class="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div class="max-w-6xl mx-auto text-center relative z-10">
        <div 
          data-section="hero"
          :class="['transition-all duration-1000 transform', isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm mb-8">
            <span class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            Blockchain-Powered Credential Registry
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-400 bg-clip-text text-transparent">
            Decentralized Academic<br/>Credential Registry
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Anchor credential records on blockchain. Enable independent integrity inspection. 
            Give students true ownership of their academic achievements.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/verify" 
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              🔍 Inspect a Record
            </router-link>
            <router-link 
              to="/login" 
              class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold text-lg transition-all"
            >
              View Demo
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator - positioned at bottom of viewport -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div class="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-32 px-4 bg-gradient-to-b from-[#0d1117] to-[#161b22]">
      <div class="max-w-6xl mx-auto">
        <div 
          data-section="how-title"
          :class="['text-center mb-20 transition-all duration-1000 transform', isVisible('how-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <h2 class="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p class="text-xl text-gray-400">A simple, transparent process for credential management</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div 
            data-section="step-1"
            :class="['p-8 bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20 rounded-2xl transition-all duration-700 delay-100 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10', isVisible('step-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
          >
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-cyan-500/20">
              1️⃣
            </div>
            <h3 class="text-2xl font-bold mb-3 text-cyan-100">Anchor</h3>
            <p class="text-gray-400">
              Institution registers credential record. File is stored on IPFS, metadata minted as NFT on blockchain.
            </p>
          </div>
          
          <!-- Step 2 -->
          <div 
            data-section="step-2"
            :class="['p-8 bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl transition-all duration-700 delay-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10', isVisible('step-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
          >
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-purple-500/20">
              2️⃣
            </div>
            <h3 class="text-2xl font-bold mb-3 text-purple-100">Share</h3>
            <p class="text-gray-400">
              Student receives NFT reference in their wallet. They can share via QR code or direct link anytime.
            </p>
          </div>
          
          <!-- Step 3 -->
          <div 
            data-section="step-3"
            :class="['p-8 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl transition-all duration-700 delay-500 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10', isVisible('step-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
          >
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-green-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-emerald-500/20">
              3️⃣
            </div>
            <h3 class="text-2xl font-bold mb-3 text-emerald-100">Inspect</h3>
            <p class="text-gray-400">
              Anyone can inspect record integrity using blockchain proof. No institution contact required.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-32 px-4">
      <div class="max-w-6xl mx-auto">
        <div 
          data-section="features-title"
          :class="['text-center mb-20 transition-all duration-1000', isVisible('features-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <h2 class="text-4xl md:text-5xl font-bold mb-4">Why Blockchain?</h2>
          <p class="text-xl text-gray-400">Solving fundamental problems in credential management</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            :data-section="'feature-' + index"
            :class="['p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all duration-500', isVisible('feature-' + index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
            :style="{ transitionDelay: (index * 100) + 'ms' }"
          >
            <div class="text-4xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
            <p class="text-gray-400 text-sm">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 px-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10">
      <div class="max-w-6xl mx-auto">
        <div 
          data-section="stats"
          :class="['grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000', isVisible('stats') ? 'opacity-100 scale-100' : 'opacity-0 scale-95']"
        >
          <div v-for="(stat, index) in stats" :key="index" class="text-center">
            <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {{ stat.value }}
            </div>
            <div class="text-gray-400 mt-2">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div 
          data-section="cta"
          :class="['transition-all duration-1000', isVisible('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Ready to Inspect a Credential?
          </h2>
          <p class="text-xl text-gray-400 mb-10">
            Enter a Token ID or scan a QR code to independently assess record integrity.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/verify" 
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              🔍 Go to Inspection Portal
            </router-link>
            <router-link 
              to="/admin-login" 
              class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold text-lg transition-all"
            >
              🏛️ Institution Login
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="py-16 px-4 bg-yellow-500/5 border-t border-yellow-500/20">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-yellow-200/70 text-sm">
          ⚠️ <strong>Important:</strong> This platform is a technical demonstration and does not claim institutional, 
          legal, or regulatory authority over academic credentials. The system provides cryptographic evidence 
          for independent integrity assessment. Trust decisions remain with the inspecting party.
        </p>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Smooth scrolling for the page */
html {
  scroll-behavior: smooth;
}
</style>
