<template>

  
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component 
        :is="Component" 
        :key="route.meta.layoutKey || route.path"
      />

    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue';

import { initTheme } from './services/theme';

onMounted(() => {
  initTheme();
});
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