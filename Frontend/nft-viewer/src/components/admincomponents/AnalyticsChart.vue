<template>
  <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
    <div class="flex items-center justify-between mb-6">
       <div>
         <h3 class="text-gray-900 dark:text-white font-bold text-lg">Issuance Velocity</h3>
         <p class="text-gray-500 dark:text-gray-400 text-sm">Certificates issued over time</p>
       </div>
       <div class="flex items-center gap-2">
         <span class="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">+12.5% this week</span>
       </div>
    </div>

    <!-- Chart Container -->
    <div class="relative h-48 w-full" @mouseleave="hoveredPoint = null">
       <!-- SVG Chart -->
       <svg v-if="dataPoints.length > 0" class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <!-- Grid Lines -->
          <line x1="0" y1="25" x2="100" y2="25" class="stroke-gray-200 dark:stroke-gray-700" stroke-width="0.5" stroke-dasharray="2" />
          <line x1="0" y1="50" x2="100" y2="50" class="stroke-gray-200 dark:stroke-gray-700" stroke-width="0.5" stroke-dasharray="2" />
          <line x1="0" y1="75" x2="100" y2="75" class="stroke-gray-200 dark:stroke-gray-700" stroke-width="0.5" stroke-dasharray="2" />

          <!-- Gradient Defs -->
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" class="stop-indigo-500" stop-opacity="0.2" />
              <stop offset="100%" class="stop-indigo-500" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- Area Path (Generated) -->
          <path 
            :d="areaPath"
            class="fill-indigo-500/20 dark:fill-indigo-500/10 transition-all duration-300"
          />

          <!-- Line Path (Generated) -->
          <path 
            :d="linePath"
            fill="none" 
            class="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-300" 
            stroke-width="2" 
            vector-effect="non-scaling-stroke"
          />
          
          <!-- Interactive Points -->
          <circle 
            v-for="(point, index) in dataPoints" 
            :key="index"
            :cx="point.x" 
            :cy="point.y" 
            r="2" 
            class="fill-indigo-600 dark:fill-white cursor-pointer transition-all duration-200"
            :class="hoveredPoint === point ? 'r-4 stroke-4 stroke-indigo-200 dark:stroke-indigo-500/50' : ''"
            @mouseenter="hoveredPoint = point"
          />
       </svg>

       <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
         No data available to display chart.
       </div>

       <!-- Tooltip -->
       <div 
         v-if="hoveredPoint"
         class="absolute z-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg py-2 px-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 w-48"
         :style="{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y - 5}%` }"
       >
         <div class="font-bold border-b border-gray-700 dark:border-gray-200 pb-1 mb-1">{{ hoveredPoint.date }}</div>
         <div class="space-y-1">
           <div v-for="(detail, i) in hoveredPoint.details" :key="i" class="flex justify-between">
             <span class="opacity-80">{{ detail.name }}</span>
             <span class="font-mono opacity-100">#{{ detail.id }}</span>
           </div>
         </div>
         <!-- Arrow -->
         <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-white"></div>
       </div>

    </div>
    
    <!-- X-Axis Labels -->
    <div class="flex justify-between text-xs text-gray-400 mt-2 font-mono">
       <span>30 Days Ago</span>
       <span>Today</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  certificates: {
    type: Array,
    default: () => []
  }
})

const hoveredPoint = ref(null)

// Computed: Process real data into chart points
const dataPoints = computed(() => {
  if (!props.certificates || props.certificates.length === 0) return []

  // 1. Group by Date (YYYY-MM-DD)
  const grouped = {}
  // Helper to normalize date
  const getDateKey = (dateStr) => {
    if (!dateStr) return 'Unknown'
    return new Date(dateStr).toISOString().split('T')[0]
  }

  // Sort Chronologically first
  const sortedCerts = [...props.certificates].sort((a, b) => {
    return new Date(a.issue_date || a.created_at) - new Date(b.issue_date || b.created_at)
  })

  // Grouping
  sortedCerts.forEach(cert => {
    const key = getDateKey(cert.issue_date || cert.created_at)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push({
      name: cert.title,
      id: cert.tokenId ? `#${cert.tokenId}` : 'Pending'
    })
  })

  // 2. Convert to Array and Limit to last X data points if needed (or normalize time)
  const keys = Object.keys(grouped)
  if (keys.length === 0) return []

  const startTime = new Date(keys[0]).getTime()
  const endTime = new Date(keys[keys.length - 1]).getTime()
  const timeSpan = endTime - startTime || 1 // Avoid divide by zero

  // 3. Map to X/Y Coordinates
  // Y-axis: Daily volume. Max volume determines Y scale.
  const maxVolume = Math.max(...Object.values(grouped).map(g => g.length))

  return keys.map(dateStr => {
    const time = new Date(dateStr).getTime()
    const volume = grouped[dateStr].length

    // X: % of time span (0 to 100)
    // If only one point, put it in middle (50)
    let x = timeSpan === 1 ? 50 : ((time - startTime) / timeSpan) * 100
    
    // Y: % of max volume (100 is bottom, 0 is top). 
    // We want higher volume = higher peak = lower Y value.
    // Padding: leave 10% space at top.
    const y = 100 - ((volume / maxVolume) * 90)

    return {
      x, 
      y, 
      date: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      details: grouped[dateStr]
    }
  })
})

// Generate SVG Paths based on dataPoints
const linePath = computed(() => {
  if (dataPoints.value.length === 0) return ''
  if (dataPoints.value.length === 1) {
     const p = dataPoints.value[0]
     return `M 0,100 L ${p.x},${p.y} L 100,100` // Triangle for single point
  }

  return dataPoints.value.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`
    
    // Smooth Bezier
    const prev = dataPoints.value[i - 1]
    const midX = (prev.x + p.x) / 2
    return `${path} C ${midX},${prev.y} ${midX},${p.y} ${p.x},${p.y}`
  }, '')
})

const areaPath = computed(() => {
  if (!linePath.value) return ''
  return `${linePath.value} L 100,100 L 0,100 Z`
})
</script>

<style scoped>
.stop-indigo-500 {
  stop-color: #6366f1;
}
</style>
