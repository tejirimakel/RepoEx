<template>
  <form
    @submit.prevent="handleSubmit"
    class="flex flex-col sm:flex-row gap-2 w-full"
  >

    <label for="search" class="sr-only">
      Search GitHub repositories
    </label>

    <div class="relative flex-1">
      <input
        id="search"
        ref="inputRef"
        v-model="localQuery"
        @input="handleInput"
        type="text"
        placeholder="Search repositories..."
        class="w-full border p-2 rounded focus:outline-none focus:ring focus:ring-gray-300"
      />

      <button
        v-if="localQuery"
        type="button"
        @click="clearSearch"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
      >
        ✕
      </button>

      <span
        v-if="isTyping"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"
      >
        typing...
      </span>
    </div>

    <button
      type="submit"
      :disabled="!localQuery || loading"
      class="px-4 py-2 rounded bg-black text-white disabled:opacity-50 hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-300"
    >
      <span v-if="loading">Searching...</span>
      <span v-else>Search</span>
    </button>

  </form>
</template>

<script setup>
import { ref, watch } from "vue"

const inputRef = ref(null)

const props = defineProps({
  modelValue: String,
  loading: Boolean
})

const emit = defineEmits([
  "update:modelValue",
  "debounced-search",
  "search"
])

const localQuery = ref(props.modelValue || "")
const isTyping = ref(false)

let debounceTimer = null


const handleInput = () => {
  const value = localQuery.value.trim()

  emit("update:modelValue", value)

  isTyping.value = true

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (!value) return
    emit("debounced-search", value)
    isTyping.value = false
  }, 500) 
}

const handleSubmit = () => {
  const value = localQuery.value.trim()
  emit("update:modelValue", value)
  emit("search")
}

const clearSearch = () => {
  localQuery.value = ""
  emit("update:modelValue", "")
  emit("search")

  inputRef.value?.focus()
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localQuery.value) {
      localQuery.value = newVal
    }
  }
)
</script>