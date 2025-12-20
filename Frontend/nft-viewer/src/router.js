import { createRouter, createWebHistory } from 'vue-router'

// 1. Views
import RegistrationPage from './views/RegistrationPage.vue'
import LoginPage from './views/LoginPage.vue'
import AdminLogin from './views/AdminLogin.vue'
import WalletDashboard from './views/WalletDashboard.vue'
import StudentDashboard from './views/StudentDashboard.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import NFTGallery from './views/NFTGallery.vue'
import BabylonScene from './views/BabylonScene.vue'
import PublicGallerySearch from './views/PublicGallerySearch.vue'

const routes = [
  { path: '/', name: 'Home', component: RegistrationPage },
  { path: '/register', redirect: '/' },
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
