<template>
  <ParticleBackground ref="particleRef" />
  
  <router-view v-slot="{ Component, route }">
    <transition 
      name="slow-construct" 
    >
      <component 
        :is="Component" 
        :key="route.path"
      />
    </transition>
  </router-view>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import ParticleBackground from './components/ParticleBackground.vue';

const router = useRouter();
const particleRef = ref(null);

// --- NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
  // Trigger Particle Build
  if (particleRef.value) {
    particleRef.value.constructShape(to.path);
  }
  next(); 
});

// onEnterFinished removed to keep particles active indefinitely
</script>

<style>
/* 
  CINEMATIC CONSTRUCTION TIMELINE (10s Total)
  --------------------------------------
  1. LEAVE Phase: 1s (Fade Out)
  2. BUILD Phase: 8s Total (4s Frame + 4s Details)
  3. ENTER Phase: 2s Fade In (Starting at T+8s)
*/

.slow-construct-leave-active {
  transition: opacity 1s ease-in, transform 1s ease-in;
}

.slow-construct-leave-to {
  opacity: 0;
  transform: scale(0.9) blur(5px);
}

.slow-construct-enter-active {
  /* Use Animation for safer delayed entry */
  animation: delayedFadeIn 10s ease-out forwards;
}

@keyframes delayedFadeIn {
  0% {
    opacity: 0;
    transform: scale(1.05) blur(5px);
  }
  80% {
    /* Wait 8s (80% of 10s) */
    opacity: 0;
    transform: scale(1.05) blur(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) blur(0);
  }
}
</style>