<template>
  <Navbar />

  <main v-if="crashed" class="flex flex-col items-center justify-center text-center py-24 px-4">
    <h1 class="text-2xl font-bold mb-2">Something went wrong</h1>
    <p class="text-gray-500 mb-6">An unexpected error occurred. Please try reloading.</p>
    <button
      @click="reload"
      class="px-4 py-2 border rounded hover:bg-gray-100 transition dark:hover:bg-neutral-700"
    >
      Reload page
    </button>
  </main>

  <router-view v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from "vue"
import Navbar from "./components/Navbar.vue"

// Component-level error boundary: a render/setup error in any route swaps the
// view for a friendly fallback instead of leaving a blank page.
const crashed = ref(false)

onErrorCaptured((err) => {
  console.error("[router-view error]:", err)
  crashed.value = true
  return false
})

const reload = () => window.location.reload()
</script>
