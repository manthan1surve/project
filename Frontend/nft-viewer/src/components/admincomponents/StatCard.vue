<template>
  <div class="glass p-4 rounded-xl">
    <p class="text-sm text-slate-400">{{ title }}</p>
    <p class="text-2xl font-semibold mt-1">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({ title: String, value: [String, Number] })
</script>
