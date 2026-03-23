<template>
  <main aria-label="home" class="px-4 md:px-8 lg:px-16 py-6 max-w-7xl mx-auto">

    <header class="mb-6 text-center">
      <h1 class="text-2xl font-bold">Repository Explorer</h1>
      <p class="text-gray-500 text-sm">
        Search and explore repositories with filters
      </p>
    </header>

    <section class="mb-6">
      <SearchBar v-model="query" @debounced-search="debounceSearch" />
    </section>

    <section class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">

      <div class="flex flex-col sm:flex-row gap-3">
        <select aria-label="sort-filters" v-model="sortBy" class="border p-2 rounded w-full sm:w-auto">
          <option value="stars">Sort by Stars</option>
          <option value="updated">Sort by Last Updated</option>
        </select>

        <select aria-label="language filters" v-model="language" class="border p-2 rounded w-full sm:w-auto">
          <option value="">All Languages</option>
          <option value="JavaScript">JavaScript</option>
          <option value="TypeScript">TypeScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
          <option value="Go">Go</option>
          <option value="Ruby">Ruby</option>
          <option value="PHP">PHP</option>
          <option value="HTML">HTML</option>
        </select>
      </div>

    </section>

    <section>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <CardSkeleton v-for="n in 6" :key="n" />

      </div>

      <div v-else-if="error" class="text-center py-10">
        <p class="text-red-500 mb-3">{{ error }}</p>
        
        <button @click="debounceSearch" class="px-4 py-2 border rounded hover:bg-gray-100 transition dark:hover:bg-neutral-700">
        Retry
      </button>
      </div>

      <div v-else-if="isEmptySearch" class="text-center py-10">
        <p class="text-gray-500">
          No repositories found for "<strong>{{ query }}</strong>"
        </p>
      </div>

      <div v-else-if="isFilteredOut" class="text-center py-10">
        <p class="text-gray-500">
          No repositories match your selected filters.
        </p>
      </div>

      <div v-else>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card v-for="repo in repos" :key="repo.id" :repo="repo" />
        </div>

        <div v-if="repos.length > 0" class="flex justify-center mt-6">
          <button v-if="hasMore" @click="loadMore" :disabled="loading"
            class="px-5 py-2 border rounded hover:bg-gray-100 transition disabled:opacity-50">
            <span v-if="loading">Loading...</span>
            <span v-else>
              Load More
            </span>
          </button>
        </div>
      </div>

    </section>

  </main>
</template>

<script setup>
import { useSearch } from "../composables/useSearch"
import SearchBar from "../components/SearchBar.vue"
import Card from "../components/Card.vue"
import CardSkeleton from "../components/CardSkeleton.vue"

const {
  query,
  repos,
  loading,
  error,
  hasMore,
  sortBy,
  language,
  debounceSearch,
  loadMore,
  isEmptySearch,
  isFilteredOut
} = useSearch()
</script>