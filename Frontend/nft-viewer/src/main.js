// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { clerkPlugin } from '@clerk/vue'
import './assets/tailwind.css'
import './assets/admin.css'


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if(!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined. Please set it in your .env file.')
}

const app = createApp(App)

app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY })

app.use(router)

app.mount('#app')
