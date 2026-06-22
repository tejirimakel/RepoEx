<template>
  <form
    role="search"
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
        aria-label="Clear search"
        @click="clearSearch"
        class="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
      >
        <span aria-hidden="true">✕</span>
      </button>
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

// localQuery is the single source of truth for the input's raw text.
// We only strip leading whitespace (so a query can't start with spaces) and
// defer trimming to search time, letting users type multi-word queries freely.
const localQuery = ref(props.modelValue || "")

const handleInput = () => {
  localQuery.value = localQuery.value.trimStart()
  emit("update:modelValue", localQuery.value)
  const value = localQuery.value.trim()
  if (value) emit("debounced-search", value)
}

const handleSubmit = () => {
  localQuery.value = localQuery.value.trim()
  emit("update:modelValue", localQuery.value)
  emit("search")
}

const clearSearch = () => {
  localQuery.value = ""
  emit("update:modelValue", "")
  emit("search")
  inputRef.value?.focus()
}

// Reconcile only when the meaningful (trimmed) value diverges — e.g. a
// programmatic reset — so it never clobbers an in-progress trailing space.
watch(
  () => props.modelValue,
  (newVal) => {
    if ((newVal || "").trim() !== localQuery.value.trim()) {
      localQuery.value = newVal || ""
    }
  }
)
</script>
