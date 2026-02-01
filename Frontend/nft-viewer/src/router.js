import { createRouter, createWebHistory } from 'vue-router'

// 1. Views
import LandingPage from './views/LandingPage.vue'
import RegistrationPage from './views/RegistrationPage.vue'
import LoginPage from './views/LoginPage.vue'
import AdminLogin from './views/AdminLogin.vue'
import WalletDashboard from './views/WalletDashboard.vue'
import StudentDashboard from './views/StudentDashboard.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import NFTGallery from './views/NFTGallery.vue'
import BabylonScene from './views/BabylonScene.vue'
import PublicGallerySearch from './views/PublicGallerySearch.vue'
import VerifyCertificate from './views/VerifyCertificate.vue'

const routes = [
  { path: '/', name: 'Home', component: LandingPage },
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
  { path: '/babylon', name: 'BabylonScene', component: BabylonScene },
  // Inspection routes (public)
  { path: '/verify', name: 'VerifySearch', component: VerifyCertificate },
  { path: '/verify/:tokenId', name: 'VerifyCertificate', component: VerifyCertificate },
  { path: '/inspect', redirect: '/verify' },
  { path: '/inspect/:tokenId', redirect: to => `/verify/${to.params.tokenId}` }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
