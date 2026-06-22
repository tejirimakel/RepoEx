<template>
  <article
    class="group p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer bg-white flex flex-col justify-between dark:bg-neutral-800 dark:border-neutral-800"
    @click="goToDetail"
  >
    <div>
      <h2 class="text-lg font-semibold">
        <router-link
          :to="detailPath"
          class="group-hover:text-purple-700 transition focus:outline-none"
        >
          {{ repo.name }}
        </router-link>
      </h2>
      <p class="text-sm text-gray-500">
        by <span class="text-purple-700">{{ repo.owner?.login }}</span>
      </p>

      <p class="text-neutral-600 mt-2 line-clamp-2 dark:text-neutral-400">
        {{ repo.description || "No description available." }}
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">
      <div class="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <RepoStat icon="⭐" label="Stars" :value="formatStars(repo.stargazers_count)" />
        <RepoStat icon="💻" label="Language" :value="repo.language || 'N/A'" />
        <RepoStat icon="🕒" label="Last updated" :value="formatDate(repo.updated_at)" />
      </div>

      <FavBtn :repo="repo" @click.stop />
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import FavBtn from "./FavBtn.vue"
import RepoStat from "./RepoStat.vue"
import { formatDate, formatStars } from "../utils/format"

const props = defineProps({
  repo: Object,
})

const router = useRouter()

const detailPath = computed(() => {
  const fullName = props.repo?.full_name
  if (!fullName) return "/"
  const [owner, name] = fullName.split("/")
  return `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`
})

// Progressive enhancement: clicking anywhere on the card navigates, except on
// the inner link/button (which handle themselves). Keyboard + screen-reader
// users use the real <router-link> above; the article has no tabindex/role.
const goToDetail = (e) => {
  if (e.target.closest("a, button")) return
  if (props.repo?.full_name) router.push(detailPath.value)
}
</script>
