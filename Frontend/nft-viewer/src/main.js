// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// --- CSS Imports ---
// Keep your friend's Tailwind/Admin styles so the UI structure stays correct
import './assets/tailwind.css'
import './assets/admin.css'
import './assets/base.css'



const app = createApp(App)

// Just the router, no Clerk plugin needed
app.use(router)

app.mount('#app')
