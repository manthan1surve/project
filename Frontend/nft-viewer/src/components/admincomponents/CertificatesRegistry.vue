<template>
  <section class="glass p-6 rounded-xl fade-slide-up">
    <h2 class="section-title mb-4">Issued Certificates</h2>

    <table class="table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Certificate</th>
          <th>Token ID</th>
          <th>Txn Hash</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(c, i) in certificates"
          :key="c.tokenId"
          class="hover:bg-white/5 transition fade-slide-up"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <td>{{ c.student }}</td>
          <td>{{ c.title }}</td>
          <td>{{ c.tokenId }}</td>
          <td class="mono">{{ short(c.txn) }}</td>
          <td>{{ c.date }}</td>
        </tr>
      </tbody>
    </table>

    <p class="immutable-note mt-3">
      Certificates are immutable and cannot be edited or deleted.
    </p>
  </section>
</template>

<script setup>
const certificates = [
  {
    student: 'Manthan Surve',
    title: 'Semester VI Certificate',
    tokenId: 'NFT-1042',
    txn: '0x9ab34c92ad8e...',
    date: '15 May 2025'
  }
]

function short(t) {
  return t.slice(0, 10) + '...'
}
</script>
