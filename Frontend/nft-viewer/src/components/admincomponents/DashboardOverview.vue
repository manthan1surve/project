<template>
<div class="stats-grid">
  <div
    v-for="(s, i) in stats"
    :key="s.label"
    class="glass stat-card animate-in"
    :class="`delay-${i + 1}`"
  >
    <p class="stat-label">{{ s.label }}</p>
    <p class="stat-value">{{ s.value }}</p>
  </div>
</div>  
</template>

<script setup>
const stats = [
  { label: 'Total Students', value: 1 },
  { label: 'Certificates Issued', value: 4 },
  { label: 'Issued Today', value: 4 },
  { label: 'Blockchain Txns', value: 512 },
  { label: 'System Uptime', value: '99.98%' }
]
</script>
