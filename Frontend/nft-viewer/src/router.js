import { createRouter, createWebHistory } from 'vue-router'



const routes = [
  { path: '/', name: 'Home', component: () => import('./views/LandingPage.vue') },
  { path: '/register', name: 'Register', component: () => import('./views/RegistrationPage.vue') },
  { path: '/login', name: 'Login', component: () => import('./views/LoginPage.vue') },
  // Student Portal Routes (Nested)
  {
    path: '/student',
    component: () => import('./components/layouts/StudentLayout.vue'),
    redirect: '/student/dashboard',
    meta: { layoutKey: 'student_portal' },
    children: [
      { path: 'dashboard', name: 'StudentDashboard', component: () => import('./views/StudentDashboard.vue') },
      { path: 'wallet', name: 'WalletDashboard', component: () => import('./views/WalletDashboard.vue') },
      { path: 'settings', name: 'Settings', component: () => import('./views/SettingsPage.vue') }
    ]
  },
  
  // Redirects for legacy routes
  { path: '/student-dashboard', redirect: '/student/dashboard' },
  { path: '/wallet', redirect: '/student/wallet' },
  { path: '/settings', redirect: '/student/settings' },
  { path: '/view-gallery', name: 'PublicSearch', component: () => import('./views/PublicGallerySearch.vue') },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('./views/NFTGallery.vue'),
    props: route => ({ address: route.query.address })
  },
  { path: '/admin-login', name: 'AdminLogin', component: () => import('./views/AdminLogin.vue') },
  { path: '/admin-dashboard', name: 'AdminDashboard', component: () => import('./views/AdminDashboard.vue') },
  { path: '/babylon', name: 'BabylonScene', component: () => import('./views/BabylonScene.vue') },
// Inspection routes (public)
  { path: '/verify', name: 'VerifySearch', component: () => import('./views/VerifyCertificate.vue') },
  { path: '/verify/:tokenId', name: 'VerifyCertificate', component: () => import('./views/VerifyCertificate.vue') },
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
