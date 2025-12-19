import { createRouter, createWebHistory } from 'vue-router'

// --- Imports ---

// 1. Shared & Friend's Components (Upstream)
import RegistrationPage from './views/RegistrationPage.vue'
import AdminLogin from './views/AdminLogin.vue'
import NFTGallery from './components/NFTGallery.vue'
import BabylonScene from './components/BabylonScene.vue'
import StudentDasboard from './components/StudentDasboard.vue'
import AdminDasboard from './components/AdminDasboard.vue'

// 2. Your Components (Stashed)
// We are using YOUR Login Page from 'views' (ignoring his 'components' version)
import LoginPage from './views/LoginPage.vue'
import WalletDashboard from './components/WalletDashboard.vue'

const routes = [
  // --- Friend's Routes ---
  {
    path: '/',
    name: 'Home', // Renamed to avoid conflict with 'Register' below
    component: RegistrationPage
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDasboard',
    component: AdminDasboard
  },
  {
    path: '/babylon',
    name: 'BabylonScene',
    component: BabylonScene
  },
  {
    path: '/student-dashboard',
    name: 'StudentDasboard',
    component: StudentDasboard
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: NFTGallery
  },

  // --- Your Routes (from Stash) ---
  {
    path: '/register',
    name: 'Register',
    component: RegistrationPage
  },
  {
    path: '/wallet',
    name: 'WalletDashboard',
    component: WalletDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
