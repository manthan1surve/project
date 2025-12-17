<template>
  <!-- ROOT -->
  <div class="relative min-h-screen overflow-hidden">
    <!-- ================= BACKGROUND VIDEO ================= -->
<!-- Background Video -->
<video
  class="fixed inset-0 w-full h-full object-cover -z-10"
  autoplay
  muted
  loop
  playsinline
>
  <source src="/bg-video.mp4" type="video/mp4" />
</video>

<!-- Dark Overlay -->
<div class="fixed inset-0 bg-black/70 -z-10"></div>


    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/50 z-10"></div>

    <!-- ================= DASHBOARD CONTENT ================= -->
    <div class="relative z-20 p-6">
      <!-- ================= HEADER / IDENTITY ================= -->
      <div class="glass identity-card">
        <div class="identity-left">
          <h1 class="student-name">{{ student.fullName }}</h1>
          <p class="student-meta">
            Roll No: {{ student.rollno }} · {{ student.course }}
          </p>
          <p class="student-meta">
            Department: {{ student.department }}
          </p>
        </div>

        <div class="identity-right">
          <span class="status verified">Verified</span>
          <p class="wallet">
            {{ shortAddress(student.walletAddress) }}
          </p>
        </div>
      </div>

      <!-- ================= DASHBOARD SUMMARY ================= -->
      <div class="summary-grid">
        <div class="glass summary-card">
          <p class="summary-label">Total Certificates Owned</p>
          <p class="summary-value">{{ summary.totalCertificates }}</p>
        </div>

        <div class="glass summary-card">
          <p class="summary-label">Latest Certificate Issued</p>
          <p class="summary-value">
            {{ summary.latestCertificate.title }}
          </p>
          <p class="summary-sub">
            {{ summary.latestCertificate.date }}
          </p>
        </div>

        <div class="glass summary-card">
          <p class="summary-label">Blockchain Network</p>
          <p class="summary-value">Private Ethereum</p>
        </div>

        <div class="glass summary-card">
          <p class="summary-label">Verification Status</p>
          <p class="summary-value verified-text">All Verified ✔</p>
        </div>
      </div>

      <!-- ================= QUICK ACTIONS ================= -->
      <div class="glass actions-card">
        <h2 class="section-title">Quick Actions</h2>

        <div class="actions-grid">
          <button class="glass-btn primary" @click="goToCertificates">
            View Certificates
          </button>

          <button class="glass-btn secondary">
            Share Verification Link
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const student = ref({
  fullName: 'Manthan Surve',
  rollno: '25TBSCIT062',
  course: 'BSc.I.T.',
  department: 'Information Technology',
  walletAddress: '0xA13fE89c3B7D2E90bA32f8A1F94aC8123E9D45bA'
})

const summary = ref({
  totalCertificates: 4,
  latestCertificate: {
    title: 'Semester VI Completion Certificate',
    date: '15 May 2025'
  }
})

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function goToCertificates() {
  router.push('/certificates')
}
</script>

<style scoped>
/* ================= GLASS BASE ================= */
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* ================= IDENTITY ================= */
.identity-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem;
  border-radius: 20px;
  margin-bottom: 2rem;
}

.student-name {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
}

.student-meta {
  color: #cbd5e1;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.identity-right {
  text-align: right;
}

.status {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.verified {
  background: rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}

.wallet {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* ================= SUMMARY ================= */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: 18px;
}

.summary-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.summary-value {
  font-size: 1.6rem;
  color: white;
  font-weight: 700;
}

.summary-sub {
  font-size: 0.75rem;
  color: #cbd5e1;
}

.verified-text {
  color: #6ee7b7;
}

/* ================= ACTIONS ================= */
.actions-card {
  padding: 1.75rem;
  border-radius: 20px;
}

.section-title {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.actions-grid {
  display: flex;
  gap: 1rem;
}

/* ================= GLASS BUTTONS ================= */
.glass-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
}

.glass-btn.primary {
  background: rgba(99, 102, 241, 0.45);
}

.glass-btn.primary:hover {
  background: rgba(99, 102, 241, 0.65);
}

.glass-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
}

.glass-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.18);
}
</style>
