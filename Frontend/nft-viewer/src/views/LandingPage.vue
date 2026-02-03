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
      } else {
        visibleSections.value.delete(entry.target.dataset.section)
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
  <div class="min-h-screen bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white transition-colors duration-300">
    <AppHeader />
    
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden">
      <!-- Colorful background glows with animation -->
      <div class="absolute top-20 left-1/4 w-96 h-96 bg-cyan-300/30 dark:bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      
      <div class="max-w-6xl mx-auto text-center relative z-10">
        <div 
          data-section="hero"
          :class="['transition-all duration-1000 transform', isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full text-cyan-600 dark:text-cyan-400 text-sm mb-8 hover:scale-105 transition-transform cursor-default">
            <span class="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-pulse"></span>
            Blockchain-Powered Achievement Registry
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-cyan-600 to-purple-600 dark:from-white dark:via-cyan-200 dark:to-purple-400 bg-clip-text text-transparent animate-gradient-x pb-2">
            Decentralized Academic<br/>Achievement Registry
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Anchor achievement records on blockchain. Enable independent integrity inspection. 
            Give students true ownership of their academic achievements.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/verify" 
              class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/50 overflow-hidden"
            >
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="relative">🔍 Inspect an Achievement</span>
            </router-link>
            <router-link 
              to="/register" 
              class="group px-8 py-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-lg text-gray-900 dark:text-white transition-all hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/30 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              Register Now
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator - positioned at bottom of viewport -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div class="w-6 h-10 border-2 border-gray-400 dark:border-white/30 rounded-full flex justify-center pt-2 backdrop-blur-sm">
          <div class="w-1 h-3 bg-gray-600 dark:bg-white/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-32 px-4 bg-white dark:bg-gradient-to-b dark:from-[#0d1117] dark:to-[#161b22] relative transition-colors duration-300">
      <!-- Decorative Elements -->
      <div class="absolute top-40 bg-cyan-500/5 w-full h-px blur-xl"></div>

      <div class="max-w-6xl mx-auto relative z-10">
        <div 
          data-section="how-title"
          :class="['text-center mb-20 transition-all duration-1000 transform', isVisible('how-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400">A simple, transparent process for achievement management</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div 
            data-section="step-1"
            :class="['group p-8 bg-white dark:bg-[#161b22] dark:bg-opacity-40 border border-gray-100 dark:border-cyan-500/20 rounded-2xl transition-all duration-500 delay-100 hover:scale-105 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 shadow-lg dark:shadow-none', isVisible('step-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
          >
            <div class="w-16 h-16 bg-cyan-50 dark:bg-gradient-to-br dark:from-cyan-500/30 dark:to-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm dark:shadow-lg dark:shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
              1️⃣
            </div>
            <h3 class="text-2xl font-bold mb-3 text-gray-900 dark:text-cyan-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Anchor</h3>
            <p class="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300">
              Institution registers credential record. File is stored on IPFS, metadata minted as NFT on blockchain.
            </p>
          </div>
          
          <!-- Step 2 -->
          <div 
            data-section="step-2"
            :class="['group p-8 bg-white dark:bg-[#161b22] dark:bg-opacity-40 border border-gray-100 dark:border-purple-500/20 rounded-2xl transition-all duration-500 delay-200 hover:scale-105 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 shadow-lg dark:shadow-none', isVisible('step-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
          >
            <div class="w-16 h-16 bg-purple-50 dark:bg-gradient-to-br dark:from-purple-500/30 dark:to-pink-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm dark:shadow-lg dark:shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
              2️⃣
            </div>
            <h3 class="text-2xl font-bold mb-3 text-gray-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Share</h3>
            <p class="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300">
              Student receives NFT reference in their wallet. They can share via QR code or direct link anytime.
            </p>
          </div>
          
          <!-- Step 3 -->
          <div 
            data-section="step-3"
            :class="['group p-8 bg-white dark:bg-[#161b22] dark:bg-opacity-40 border border-gray-100 dark:border-emerald-500/20 rounded-2xl transition-all duration-500 delay-300 hover:scale-105 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 shadow-lg dark:shadow-none', isVisible('step-3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
          >
            <div class="w-16 h-16 bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/30 dark:to-green-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm dark:shadow-lg dark:shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
              3️⃣
            </div>
            <h3 class="text-2xl font-bold mb-3 text-gray-900 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Inspect</h3>
            <p class="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300">
              Anyone can inspect record integrity using blockchain proof. No institution contact required.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-32 px-4 relative overflow-hidden bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
      <!-- Background Shapes -->
      <div class="absolute top-1/3 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-1/3 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-float-delayed"></div>

      <div class="max-w-6xl mx-auto relative z-10">
        <div 
          data-section="features-title"
          :class="['text-center mb-20 transition-all duration-1000', isVisible('features-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Why Blockchain?</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400">Solving fundamental problems in credential management</p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            :data-section="'feature-' + index"
            :class="['group p-6 bg-white dark:bg-[#161b22] dark:bg-opacity-40 border border-gray-100 dark:border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-md', isVisible('feature-' + index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
            :style="{ transitionDelay: (index * 100) + 'ms' }"
          >
            <div class="text-4xl mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{{ feature.icon }}</div>
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{{ feature.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-900 dark:group-hover:text-gray-300">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 px-4 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-blue-600/10 transition-colors duration-300">
      <div class="max-w-6xl mx-auto">
        <div 
          data-section="stats"
          :class="['grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000', isVisible('stats') ? 'opacity-100 scale-100' : 'opacity-0 scale-95']"
        >
          <div v-for="(stat, index) in stats" :key="index" class="text-center">
            <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {{ stat.value }}
            </div>
            <div class="text-gray-600 dark:text-gray-400 mt-2">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION: Problem vs. Solution -->
    <section class="py-32 px-4 bg-white dark:bg-[#0d1117] relative overflow-hidden transition-colors duration-300">
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
      
      <div class="max-w-6xl mx-auto relative z-10">
         <div class="text-center mb-20">
           <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">The Evolution of Trust</h2>
           <p class="text-xl text-gray-600 dark:text-gray-400">Why blockchain is the modern standard for achievements</p>
         </div>

         <div class="grid md:grid-cols-2 gap-12">
            <!-- OLD WAY -->
            <div class="group p-8 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-900/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10">
               <h3 class="text-2xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center gap-2">
                 <span class="group-hover:scale-125 transition-transform duration-300">📄</span> Paper Credentials
               </h3>
               <ul class="space-y-4 text-gray-600 dark:text-gray-400">
                 <li class="flex items-start gap-3">
                   <span class="text-red-500">❌</span>
                   <span><strong>Fragile & Losable:</strong> Physical documents deteriorate and are easily lost.</span>
                 </li>
                 <li class="flex items-start gap-3">
                   <span class="text-red-500">❌</span>
                   <span><strong>Slow Verification:</strong> Employers must call institutions manually.</span>
                 </li>
                 <li class="flex items-start gap-3">
                   <span class="text-red-500">❌</span>
                   <span><strong>Forgery Risk:</strong> High risk of diploma mills and Photoshop edits.</span>
                 </li>
               </ul>
            </div>

            <!-- NEW WAY -->
            <div class="group p-8 border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-900/10 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10">
               <div class="absolute top-0 right-0 w-32 h-32 bg-green-200/50 dark:bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-300/50 dark:group-hover:bg-green-500/20 transition-colors duration-500"></div>
               <h3 class="text-2xl font-bold text-green-600 dark:text-green-400 mb-6 flex items-center gap-2">
                 <span class="group-hover:scale-125 transition-transform duration-300">⛓️</span> (formerly known as DCIVS) Achievements
               </h3>
               <ul class="space-y-4 text-gray-600 dark:text-gray-400">
                 <li class="flex items-start gap-3">
                   <span class="text-green-500">✅</span>
                   <span><strong>Permanent & Secure:</strong> Anchored on Ethereum, impossible to alter.</span>
                 </li>
                 <li class="flex items-start gap-3">
                   <span class="text-green-500">✅</span>
                   <span><strong>Instant Inspection:</strong> Verifiable in seconds via QR or Token ID.</span>
                 </li>
                 <li class="flex items-start gap-3">
                   <span class="text-green-500">✅</span>
                   <span><strong>Student Owned:</strong> Controlled via private keys, accessible forever.</span>
                 </li>
               </ul>
            </div>
         </div>
      </div>
    </section>

    <!-- NEW SECTION: For Whom? -->
    <section class="py-32 px-4 bg-gray-50 dark:bg-gradient-to-b dark:from-[#161b22] dark:to-[#0d1117] relative transition-colors duration-300">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-20">
           <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Built for the Ecosystem</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
           <div class="group p-8 bg-white dark:bg-blue-900/10 border border-gray-100 dark:border-blue-500/20 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 shadow-lg dark:shadow-none">
              <div class="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">🎓</div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-blue-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">For Students</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 group-hover:text-gray-900 dark:group-hover:text-gray-300">
                 No more requesting transcripts or paying for duplicates. Your achievements live in your digital wallet. Share them instantly on LinkedIn, resumes, or via email with a cryptographic proof of authenticity.
              </p>
              <ul class="text-sm text-blue-600/80 dark:text-blue-200/80 space-y-2">
                 <li>• True Ownership</li>
                 <li>• Portability</li>
                 <li>• Privacy Control</li>
              </ul>
           </div>

           <div class="group p-8 bg-white dark:bg-purple-900/10 border border-gray-100 dark:border-purple-500/20 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 shadow-lg dark:shadow-none">
              <div class="text-5xl mb-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">🏢</div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-purple-100 mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">For Employers</h3>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 group-hover:text-gray-900 dark:group-hover:text-gray-300">
                 Stop waiting weeks for background checks. Verify candidate claims instantly using the public blockchain ledger. Eliminate fraud risk and hire with absolute confidence.
              </p>
              <ul class="text-sm text-purple-600/80 dark:text-purple-200/80 space-y-2">
                 <li>• Instant Verification</li>
                 <li>• Zero Cost Inspection</li>
                 <li>• Fraud-Proof</li>
              </ul>
           </div>
        </div>
      </div>
    </section>

    <!-- NEW SECTION: Technology Stack -->
    <section class="py-32 px-4 relative overflow-hidden bg-white dark:bg-[#0d1117] transition-colors duration-300">
      <!-- Background Blobs -->
      <div class="absolute left-0 top-1/2 w-96 h-96 bg-gray-100 dark:bg-gray-800/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>

      <div class="max-w-5xl mx-auto text-center relative z-10">
         <div class="mb-16">
           <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Powered by Modern Standards</h2>
           <p class="text-gray-600 dark:text-gray-400">Leveraging the world's most secure decentralized networks</p>
         </div>
         
         <div class="grid md:grid-cols-2 gap-12 text-left">
            <div class="group flex gap-6 items-start p-6 rounded-2xl transition-colors hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/5">
               <div class="text-4xl p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm dark:shadow-none transition-all duration-300">⟠</div>
               <div>
                  <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Ethereum Blockchain</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-300">
                     The global standard for smart contracts. We use ERC-721 non-fungible tokens to represent unique achievements. This ensures that every record is globally unique, timestamped, and immutably linked to the issuing institution.
                  </p>
               </div>
            </div>
            <div class="group flex gap-6 items-start p-6 rounded-2xl transition-colors hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/5">
               <div class="text-4xl p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm dark:shadow-none transition-all duration-300">📦</div>
               <div>
                  <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">IPFS Storage</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-300">
                     InterPlanetary File System (IPFS) creates a decentralized content-addressable storage layer. Your actual achievement files (PDFs, Images) are distributed across the network, preventing single points of failure.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </section>

    <!-- NEW SECTION: FAQ -->
    <section class="py-32 px-4 bg-gray-50 dark:bg-gray-900/30 transition-colors duration-300">
      <div class="max-w-3xl mx-auto">
         <h2 class="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Frequently Asked Questions</h2>
         
         <div class="space-y-6">
            <div class="collapse collapse-plus bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
               <div class="p-6">
                  <h4 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">What if I lose my private key?</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                     Your private key is the only way to access your wallet. Like cash, if you lose it, it cannot be recovered. We recommend using a secure password manager or hardware wallet backup.
                  </p>
               </div>
            </div>
            
            <div class="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
                  <h4 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">Is this GDPR compliant?</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                     Yes. We anchor only cryptographic hashes and metadata references on-chain. Personal identifiable information (PII) is stored off-chain (IPFS) or within the institution's private database, allowing for "Right to be Forgotten" compliance if needed.
                  </p>
            </div>

            <div class="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
                  <h4 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">Who pays the gas fees?</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                     The issuing institution pays the gas fees when they anchor the record. Students and employers pay nothing to view, inspect, or share their achievements.
                  </p>
            </div>
         </div>
      </div>
    </section>



    <!-- CTA Section -->
    <section class="py-32 px-4 relative overflow-hidden">
      <!-- Background Glow -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-600/10 dark:to-purple-600/10 animate-pulse-slow"></div>
      
      <div class="max-w-4xl mx-auto text-center relative z-10">
        <div 
          data-section="cta"
          :class="['transition-all duration-1000', isVisible('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10']"
        >
          <h2 class="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-gray-900 to-purple-600 dark:from-blue-200 dark:via-white dark:to-purple-200 bg-clip-text text-transparent animate-gradient-x">
            Ready to Inspect an Achievement?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Enter a Token ID or scan a QR code to independently assess record integrity.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/verify" 
              class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg overflow-hidden shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-blue-500/40 text-white"
            >
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span class="relative flex items-center gap-2">
                <span>🔍</span> Go to Inspection Portal
              </span>
            </router-link>
            
            <router-link 
              to="/admin-login" 
              class="group relative px-8 py-4 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-lg overflow-hidden transition-all hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/30 text-gray-900 dark:text-white"
            >
               <span class="relative flex items-center gap-2">
                <span>🏛️</span> Institution Login
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="py-16 px-4 bg-yellow-50 dark:bg-yellow-500/5 border-t border-yellow-200 dark:border-yellow-500/20 backdrop-blur-sm">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-yellow-800 dark:text-yellow-200/70 text-sm">
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

/* Custom Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 8s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 5s ease infinite;
}

.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}
</style>
