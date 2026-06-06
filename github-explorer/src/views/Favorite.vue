<template>
  <main aria-label="favorites" class="px-4 md:px-8 lg:px-16 py-6 max-w-7xl mx-auto">

    <header class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Favorites</h1>
        <p class="text-gray-500 text-sm">Your saved repositories</p>
      </div>

      <div v-if="favorites.length > 0 && !confirmingClear" class="flex items-center">
        <button
          aria-label="Clear all favorites"
          @click="confirmingClear = true"
          class="text-sm text-red-500 hover:underline px-3"
        >
          Clear all
        </button>
      </div>

      <div v-if="confirmingClear" class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">Remove all?</span>
        <button
          @click="confirmClear"
          class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Yes
        </button>
        <button
          @click="confirmingClear = false"
          class="px-3 py-1 rounded border hover:bg-gray-100 transition dark:hover:bg-neutral-700"
        >
          Cancel
        </button>
      </div>
    </header>

    <section>

      <div v-if="favorites.length === 0" class="flex flex-col items-center justify-center text-center py-16">
        <p class="text-gray-500 mb-4">You haven't added any favorites yet.</p>
        <router-link to="/" class="px-4 py-2 border rounded hover:bg-gray-100 transition">
          Explore Repositories
        </router-link>
      </div>

      <div v-else>
        <p class="text-sm text-gray-500 mb-4">
          {{ favorites.length }}
          {{ favorites.length === 1 ? "repository" : "repositories" }} saved
        </p>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card v-for="repo in favorites" :key="repo.id" :repo="repo" />
        </div>
      </div>

    </section>

  </main>
</template>

<script setup>
import { ref } from "vue"
import { useFavorites } from "../composables/useFavorites"
import Card from "../components/Card.vue"

const { favorites, clearFavorites } = useFavorites()

const confirmingClear = ref(false)

const confirmClear = () => {
  clearFavorites()
  confirmingClear.value = false
}
</script>
