<template>
  <article
    class="group p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer bg-white flex flex-col justify-between dark:bg-neutral-800 dark:border-neutral-800"
    role="button"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter="goToDetail"
  >
    <div>
    
      <h2 class="text-lg font-semibold group-hover:text-blue-600 transition">
        {{ repo.name }}
      </h2>

      <p class="text-sm text-gray-500">
        by <span class="text-purple-400">{{ repo.owner.login }}</span>
      </p>

      <p class="text-neutral-600 mt-2 line-clamp-3 dark:text-neutral-400">
        {{ repo.description || "No description available." }}
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">

      <div class="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <span class="flex items-center gap-1">
          ⭐ <span>{{ repo.stargazers_count }}</span>
        </span>

        <span class="flex items-center gap-1">
          💻 <span>{{ repo.language || "N/A" }}</span>
        </span>

        <span class="flex items-center gap-1">
          🕒 <span>{{ formatDate(repo.updated_at) }}</span>
        </span>
      </div>

      <FavBtn :repo="repo" @click.stop />
    </div>

  </article>
</template>

<script setup>
import { useRouter } from "vue-router"
import FavBtn from "./FavBtn.vue"

const props = defineProps({
  repo: Object
})

const router = useRouter()

const goToDetail = () => {
  const fullName = props.repo?.full_name

  if (!fullName) {
    console.error("Missing full_name:", props.repo)
    return
  }

  const [owner, name] = fullName.split("/")

  router.push(`/repo/${owner}/${name}`)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}
</script>