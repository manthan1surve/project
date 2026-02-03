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
import SettingsPage from './views/SettingsPage.vue'

const routes = [
  { path: '/', name: 'Home', component: LandingPage },
  { path: '/register', name: 'Register', component: RegistrationPage },
  { path: '/login', name: 'Login', component: LoginPage },
  // Student Portal Routes (Nested)
  {
    path: '/student',
    component: () => import('./components/layouts/StudentLayout.vue'),
    redirect: '/student/dashboard',
    meta: { layoutKey: 'student_portal' },
    children: [
      { path: 'dashboard', name: 'StudentDashboard', component: StudentDashboard },
      { path: 'wallet', name: 'WalletDashboard', component: WalletDashboard },
      { path: 'settings', name: 'Settings', component: SettingsPage }
    ]
  },
  
  // Redirects for legacy routes
  { path: '/student-dashboard', redirect: '/student/dashboard' },
  { path: '/wallet', redirect: '/student/wallet' },
  { path: '/settings', redirect: '/student/settings' },
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
  { path: '/inspect/:tokenId', redirect: to => `/verify/${to.params.tokenId}` },
  
  // New Pages
  { path: '/about', name: 'AboutUs', component: () => import('./views/AboutUs.vue') },
  { path: '/PAGEDOESNOTEXIST', redirect: '/404' },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('./views/NotFound.vue') }
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
