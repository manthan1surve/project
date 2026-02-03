<template>
  <button 
    @click="toggleTheme" 
    class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    :class="isDark ? 'bg-slate-700' : 'bg-sky-200'"
    title="Toggle Theme"
  >
    <!-- Track Icons -->
    <div class="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
      <span class="text-[10px] transform translate-x-0.5">🌙</span>
      <span class="text-[10px] transform -translate-x-0.5">☀️</span>
    </div>

    <!-- Sliding Circle -->
    <div 
      class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-xs"
      :class="isDark ? 'translate-x-7' : 'translate-x-0'"
    >
      <!-- Optional: Dynamic Icon inside knob -->
      <span v-if="isDark" class="text-indigo-600 opacity-0">🌙</span>
      <span v-else class="text-amber-500 opacity-0">☀️</span>
    </div>
  </button>
</template>

<script setup>
import { isDark, toggleTheme as originalToggle } from '../services/theme'
import AudioService from '../services/audio'

function toggleTheme() {
  AudioService.playClick()
  originalToggle()
}
</script>
