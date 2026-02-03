<template>
  <div class="animate-pulse space-y-4">
    <!-- Image/Icon Placeholder -->
    <div v-if="type === 'card'" class="w-full bg-gray-200 dark:bg-gray-700/50 rounded-xl aspect-[4/3]"></div>
    <div v-if="type === 'profile'" class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700/50 mx-auto"></div>
    
    <!-- Text Lines -->
    <div class="space-y-2">
      <div class="h-4 bg-gray-200 dark:bg-gray-700/50 rounded w-3/4" :class="{'mx-auto': type === 'profile'}"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700/50 rounded w-1/2" :class="{'mx-auto': type === 'profile'}"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'text', // 'text', 'card', 'profile'
    validator: (val) => ['text', 'card', 'profile'].includes(val)
  }
})
</script>
