<template>
  <v-app>
    <main class="container">
      <h1>Vite + Vue + TypeScript + Pinia</h1>
      <section class="card">
        <p>Count: {{ counter.count }}</p>
        <div class="buttons">
          <v-btn class="v-btn" @click="counter.increment">Increment</v-btn>
          <button @click="counter.$reset">Reset</button>
        </div>
      </section>
    </main>
  </v-app>
</template>

<script setup lang="ts">
import { useCounterStore } from './stores/counter'

const counter = useCounterStore()
</script>

<style scoped>
.container {
  padding: 2rem;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}
.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
