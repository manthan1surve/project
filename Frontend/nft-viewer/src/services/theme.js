import { ref, watch } from 'vue'

const THEME_KEY = 'dcivs-theme'
const isDark = ref(true) // Default to dark mode

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
  const cachedTheme = localStorage.getItem(THEME_KEY)
  
  if (cachedTheme) {
    isDark.value = cachedTheme === 'dark'
  } else {
    // Default to dark mode as per original design vibe
    isDark.value = true
  }
  
  applyTheme()
}

/**
 * Toggle between light and dark mode
 */
function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

/**
 * Apply the current theme to the document root
 */
function applyTheme() {
  const root = document.documentElement
  
  if (isDark.value) {
    root.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    root.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

export { isDark, initTheme, toggleTheme }
