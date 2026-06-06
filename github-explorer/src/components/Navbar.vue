<template>
  <header class="border-b bg-white sticky top-0 z-50 dark:bg-neutral-900 dark:border-neutral-700">
    <nav class="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

      <div class="text-xl md:text-2xl font-bold">
        <router-link to="/" class="hover:text-neutral-500 transition dark:hover:text-neutral-300">
          GitHub Explorer
        </router-link>
      </div>

      <div class="hidden md:flex items-center gap-6">
        <router-link to="/" class="nav-link" active-class="active-link">Home</router-link>
        <router-link to="/favorite" class="nav-link" active-class="active-link">Favorites</router-link>
      </div>

      <button
        class="md:hidden text-xl relative z-50"
        :aria-label="isOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span aria-hidden="true" v-if="isOpen">✕</span>
        <span aria-hidden="true" v-else>☰</span>
      </button>
    </nav>

    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="md:hidden px-4 py-4 space-y-2 border-t bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
      >
        <router-link to="/" class="block nav-link" active-class="active-link" @click="isOpen = false">
          Home
        </router-link>
        <router-link to="/favorite" class="block nav-link" active-class="active-link" @click="isOpen = false">
          Favorites
        </router-link>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, watch } from "vue"
import { useRoute } from "vue-router"

const isOpen = ref(false)
const route = useRoute()

watch(route, () => {
  isOpen.value = false
})
</script>
