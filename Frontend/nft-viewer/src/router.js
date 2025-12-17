import { createRouter, createWebHistory } from 'vue-router'

import RegistrationPage from './views/RegistrationPage.vue'
import AdminLogin from './views/AdminLogin.vue'
import LoginPage from './components/LoginPage.vue'
import NFTGallery from './components/NFTGallery.vue'
import BabylonScene from './components/BabylonScene.vue'
import StudentDasboard from './components/StudentDasboard.vue'
import AdminDasboard from './components/AdminDasboard.vue'

const routes = [
  {
    path: '/',
    name: 'Register',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
