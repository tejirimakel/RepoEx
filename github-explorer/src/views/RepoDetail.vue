<template>
  <main aria-label="repo details" class="px-4 md:px-8 py-6 max-w-3xl mx-auto">

    <button @click="goBack">← Back</button>

    <section v-if="loading">

      <CardSkeleton v-for="n in 3" :key="n" />

    </section>

    <section v-else-if="error" class="text-center py-10">
      <p class="text-red-500 mb-3">{{ error }}</p>

      <button @click="fetchRepo" class="px-4 py-2 border rounded hover:bg-gray-100 transition">
        Retry
      </button>
    </section>

    <section v-else-if="repo" class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold">{{ repo.name }}</h1>
        <p class="text-neutral-600 mt-1 dark:text-neutral-400">
          {{ repo.description || "No description available" }}
        </p>
      </div>

      <div class="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <span>⭐ {{ formatStars(repo.stargazers_count) }}</span>
        <span>💻 {{ repo.language || "N/A" }}</span>
        <span>🕒 {{ formatDate(repo.updated_at) }}</span>
      </div>

      <a :href="repo.html_url" target="_blank" class="inline-block text-blue-500 hover:underline">
        View on GitHub ↗
      </a>

      <div class="mt-6">
        <h2 class="font-semibold mb-2">Top Contributors</h2>

        <p v-if="contributors.length === 0" class="text-gray-500">
          No contributors found.
        </p>

        <ul class="space-y-2">
          <li v-for="user in contributors.slice(0, 5)" :key="user.id"
            class="flex items-center justify-between p-2 border rounded hover:bg-gray-50 transition">
            <div class="flex items-center gap-2">
              <img :src="user.avatar_url" :alt="user.login" class="w-6 h-6 rounded-full" />
              <span>{{ user.login }}</span>
            </div>

            <span class="text-sm text-gray-500">
              {{ user.contributions }} commits
            </span>
          </li>
        </ul>
      </div>

    </section>

    <section v-else class="text-center py-10">
      <p>Repository not found.</p>
    </section>

  </main>
</template>

<script setup>
import { ref} from "vue"
import { useRoute, useRouter } from "vue-router"
import { getRepo, getContributors } from "../api/git"
import CardSkeleton from "../components/CardSkeleton.vue"


const route = useRoute()
const router = useRouter()

const repo = ref(null)
const contributors = ref([])
const loading = ref(true)
const error = ref(null)

const fetchRepo = async () => {
  const { owner, name } = route.params

  if (!owner || !name) {
    error.value = "Invalid repository URL"
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const [repoData, contributorsData] = await Promise.all([
      getRepo(owner, name),
      getContributors(owner, name)
    ])

    repo.value = repoData
    contributors.value = contributorsData

  } catch (err) {
    error.value = err?.message || "Failed to load repository"
  } finally {
    loading.value = false
  }
}

fetchRepo()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push("/")
  }
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString()

const formatStars = (num) =>
 Intl.NumberFormat("en", { notation: "compact" }).format(num)
</script>