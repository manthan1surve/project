<template>
  <ParticleBackground2 />
  
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component 
        :is="Component" 
        :key="route.path"
      />
    </transition>
  </router-view>
</template>

<script setup>
import ParticleBackground2 from './components/ParticleBackground2.vue';
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>