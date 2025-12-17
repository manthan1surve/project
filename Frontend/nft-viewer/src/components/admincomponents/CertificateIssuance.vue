<template>
  <div class="glass p-4">
    <h2 class="section-title">Issue Certificate</h2>

    <div class="form-stack">
      <!-- STUDENT DROPDOWN -->
      <select v-model="selectedStudent" class="input">
        <option disabled value="">Select Student</option>

        <option
          v-for="student in students"
          :key="student.roll"
          :value="student"
        >
          {{ student.name }} ({{ student.roll }})
        </option>
      </select>

      <!-- CERTIFICATE TITLE -->
      <input
        v-model="title"
        class="input"
        placeholder="Certificate Title"
      />

      <!-- FILE -->
      <input type="file" class="input" />
    </div>

    <button
      class="btn-primary w-full mt-4"
      :disabled="!selectedStudent || !title"
      @click="issue"
    >
      Mint & Transfer NFT
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const students = ref([
  {
    name: 'Manthan Surve',
    roll: '25TBSCIT062',
    wallet: '0xA13f...2E9'
  }
])

const selectedStudent = ref('')
const title = ref('')

function issue() {
  console.log('Student:', selectedStudent.value)
  console.log('Certificate:', title.value)

  alert(`NFT issued to ${selectedStudent.value.name}`)
}
</script>
