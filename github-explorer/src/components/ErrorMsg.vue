<template>
  <div role="alert" class="bg-red-100 text-red-700 p-4 rounded">
    <h2 class="text-lg font-bold mb-2">Error</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
})
</script>
