<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white flex flex-col relative overflow-hidden transition-colors duration-300">
    
    <!-- Glitch Background -->
    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
       <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-[100px] animate-pulse"></div>
       <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse delay-700"></div>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
      
      <h1 class="text-[150px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-gray-800 dark:via-white to-blue-500 glitch-text transition-colors" data-text="404">
        404
      </h1>
      
      <div class="text-2xl md:text-3xl font-bold mb-8 text-center typewriter">
        <span class="text-red-600 dark:text-red-500 transition-colors">&lt;Error&gt;</span> Page Not Found <span class="text-red-600 dark:text-red-500 transition-colors">&lt;/Error&gt;</span>
      </div>

      <p class="text-gray-600 dark:text-gray-400 max-w-md text-center mb-12 transition-colors">
        The block you are looking for has not been mined or does not exist on this chain.
      </p>

      <router-link 
        to="/" 
        class="group relative px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-lg overflow-hidden transition-all hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/30 hover:scale-105 shadow-md dark:shadow-none"
      >
        <span class="relative flex items-center gap-2 text-gray-900 dark:text-white transition-colors">
           <span>🏠</span> Return to Base
        </span>
      </router-link>

    </div>

    <!-- Code Rain decoration -->
    <div class="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-50 dark:from-[#0d1117] to-transparent z-20 transition-colors duration-300"></div>
  </div>
</template>

<style scoped>
.glitch-text {
  position: relative;
  animation: glitch 2s infinite;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -1px 0 red;
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -1px 0 blue;
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim 2.5s infinite linear alternate-reverse;
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-anim {
  0% { clip: rect(35px, 9999px, 81px, 0); }
  20% { clip: rect(10px, 9999px, 13px, 0); }
  40% { clip: rect(98px, 9999px, 126px, 0); }
  60% { clip: rect(26px, 9999px, 89px, 0); }
  80% { clip: rect(44px, 9999px, 73px, 0); }
  100% { clip: rect(66px, 9999px, 39px, 0); }
}

@keyframes glitch-anim-2 {
  0% { clip: rect(12px, 9999px, 55px, 0); }
  20% { clip: rect(120px, 9999px, 15px, 0); }
  40% { clip: rect(54px, 9999px, 86px, 0); }
  60% { clip: rect(32px, 9999px, 98px, 0); }
  80% { clip: rect(18px, 9999px, 4px, 0); }
  100% { clip: rect(9px, 9999px, 128px, 0); }
}
</style>
