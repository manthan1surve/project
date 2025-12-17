<template>
  <div class="relative min-h-screen bg-black text-white">

    <!-- Background Video -->
    <video
      class="absolute inset-0 w-full h-full object-cover z-0"
      autoplay
      muted
      loop
      playsinline
    >
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>

    <!-- Dark Overlay -->
    <div class="fixed inset-0 bg-black/70 z-0"></div>

    <!-- Dashboard Content -->
    <main class="relative z-10 dashboard-shell">

      <!-- Header -->
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button class="btn-danger" @click="logout">
          Logout
        </button>
      </header>

      <!-- Stats -->
      <DashboardOverview />

      <!-- Main Grid -->
      <section class="dashboard-grid">
        <StudentManagement />
        <CertificateIssuance />
      </section>

      <!-- Issued Certificates -->
      <CertificatesRegistry />

    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import DashboardOverview from './admincomponents/DashboardOverview.vue'
import StudentManagement from './admincomponents/StudentManagement.vue'
import CertificateIssuance from './admincomponents/CertificateIssuance.vue'
import CertificatesRegistry from './admincomponents/CertificatesRegistry.vue'

const router = useRouter()

const logout = () => {
  // Clear admin session
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')

}
</script>