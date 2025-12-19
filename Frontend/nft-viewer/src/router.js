import { createRouter, createWebHistory } from 'vue-router'

// 1. Views
import RegistrationPage from './views/RegistrationPage.vue'
import LoginPage from './components/LoginPage.vue'
import AdminLogin from './views/AdminLogin.vue'

// 2. Components
import WalletDashboard from './components/WalletDashboard.vue'

import StudentDashboard from './components/StudentDashboard.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import NFTGallery from './components/NFTGallery.vue'
import BabylonScene from './components/BabylonScene.vue'

// 3. Public Search
// Ensure you actually renamed components/LoginPage.vue to PublicGallerySearch.vue
import PublicGallerySearch from './views/PublicGallerySearch.vue'

const routes = [
  { path: '/', redirect: '/register' },
  { path: '/register', name: 'Register', component: RegistrationPage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/wallet', name: 'WalletDashboard', component: WalletDashboard },
  { path: '/student-dashboard', name: 'StudentDashboard', component: StudentDashboard },
  { path: '/view-gallery', name: 'PublicSearch', component: PublicGallerySearch },
  {
    path: '/gallery',
    name: 'Gallery',
    component: NFTGallery,
    props: route => ({ address: route.query.address })
  },
  { path: '/admin-login', name: 'AdminLogin', component: AdminLogin },
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/babylon', name: 'BabylonScene', component: BabylonScene }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
