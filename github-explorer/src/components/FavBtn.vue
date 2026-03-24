<template>
  <button title="toggle favorite" @click.stop="handleClick"
    class="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
    :class="isFav
      ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600'
      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900'" :aria-pressed="isFav"
    aria-label="Toggle favorite repository">
    <span class="text-base transition-transform duration-200" :class="isFav ? 'scale-110' : ''">
      {{ isFav ? "★" : "☆" }}
    </span>

    <span>
      {{ isFav ? "Saved" : "Save" }}
    </span>
  </button>
</template>

<script setup>
import { computed } from "vue"
import { useFavorites } from "../composables/useFavorites"

const props = defineProps({
  repo: Object
})

const { isFavorite, toggleFavorite } = useFavorites()

const isFav = computed(() => isFavorite(props.repo.id))

const handleClick = () => {
  toggleFavorite(props.repo)
}
</script>