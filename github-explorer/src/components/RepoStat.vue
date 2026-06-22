<template>
  <span class="flex items-center gap-1">
    <span aria-hidden="true">{{ icon }}</span>
    <span class="sr-only">{{ label }}: </span>
    <span>{{ value }}</span>
  </span>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
})
</script>
