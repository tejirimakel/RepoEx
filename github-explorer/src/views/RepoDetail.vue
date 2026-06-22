<template>
  <main id="main" tabindex="-1" aria-label="Repository details" class="px-4 md:px-8 py-6 max-w-3xl mx-auto">

    <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>

    <button
      @click="goBack"
      class="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-black transition dark:text-neutral-400 dark:hover:text-white"
    >
      <span aria-hidden="true">←</span> Back
    </button>

    <section v-if="loading">
      <CardSkeleton v-for="n in 3" :key="n" />
    </section>

    <section v-else-if="error" class="text-center py-10">
      <ErrorMsg :message="error" class="mb-3 text-left" />
      <RetryBtn @click="fetchRepo" />
    </section>

    <section v-else-if="repo" class="space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">{{ repo.name }}</h1>
          <p class="text-neutral-600 mt-1 dark:text-neutral-400">
            {{ repo.description || "No description available" }}
          </p>
        </div>
        <FavBtn :repo="repo" class="shrink-0" />
      </div>

      <div class="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <RepoStat icon="⭐" label="Stars" :value="formatStars(repo.stargazers_count)" />
        <RepoStat icon="💻" label="Language" :value="repo.language || 'N/A'" />
        <RepoStat icon="🕒" label="Last updated" :value="formatDate(repo.updated_at)" />
      </div>

      <a
        :href="repo.html_url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block text-blue-500 hover:underline"
      >
        View on GitHub <span aria-hidden="true">↗</span>
      </a>

      <div class="mt-6">
        <h2 class="font-semibold mb-2">Top Contributors</h2>

        <p v-if="contributorsError" class="text-gray-500">
          Couldn't load contributors.
        </p>

        <p v-else-if="contributors.length === 0" class="text-gray-500">
          No contributors found.
        </p>

        <ul v-else class="space-y-2">
          <li
            v-for="user in contributors"
            :key="user.id"
            class="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
          >
            <div class="flex items-center gap-2">
              <img
                :src="user.avatar_url"
                :alt="user.login"
                class="w-6 h-6 rounded-full"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span>{{ user.login }}</span>
            </div>
            <span class="text-sm text-gray-500">{{ user.contributions }} commits</span>
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
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getRepo, getContributors } from "../api/git"
import { formatDate, formatStars } from "../utils/format"
import CardSkeleton from "../components/CardSkeleton.vue"
import FavBtn from "../components/FavBtn.vue"
import ErrorMsg from "../components/ErrorMsg.vue"
import RetryBtn from "../components/retryBtn.vue"
import RepoStat from "../components/RepoStat.vue"

const route = useRoute()
const router = useRouter()

const repo = ref(null)
const contributors = ref([])
const contributorsError = ref(false)
const loading = ref(true)
const error = ref(null)

const statusMessage = computed(() => (loading.value ? "Loading repository…" : ""))

let abortController = null

const fetchRepo = async () => {
  const { owner, name } = route.params

  if (!owner || !name) {
    error.value = "Invalid repository URL"
    loading.value = false
    return
  }

  abortController?.abort()
  abortController = new AbortController()
  const { signal } = abortController

  loading.value = true
  error.value = null
  contributorsError.value = false

  // allSettled so a contributors failure (403 on huge repos, network) never
  // blocks the main repo detail from rendering.
  const [repoResult, contributorsResult] = await Promise.allSettled([
    getRepo(owner, name, signal),
    getContributors(owner, name, signal)
  ])

  if (signal.aborted) return

  if (repoResult.status === "fulfilled") {
    repo.value = repoResult.value
  } else if (repoResult.reason?.name !== "AbortError") {
    error.value = repoResult.reason?.message || "Failed to load repository"
  }

  if (contributorsResult.status === "fulfilled") {
    contributors.value = Array.isArray(contributorsResult.value)
      ? contributorsResult.value
      : []
  } else if (contributorsResult.reason?.name !== "AbortError") {
    contributorsError.value = true
  }

  loading.value = false
}

onMounted(fetchRepo)
onUnmounted(() => abortController?.abort())

const goBack = () => router.back()
</script>
