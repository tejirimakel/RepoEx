<template>
  <button
    @click.stop="handleClick"
    class="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-400"
    :class="isFav
      ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
    :aria-pressed="isFav"
    :aria-label="isFav ? 'Remove from favorites' : 'Add to favorites'"
  >
    <span aria-hidden="true" class="text-base transition-transform duration-200" :class="isFav ? 'scale-110' : ''">
      {{ isFav ? "★" : "☆" }}
    </span>
    <span>{{ isFav ? "Saved" : "Save" }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue"
import { useFavorites } from "../composables/useFavorites"

const props = defineProps({
  repo: Object
})

const { isFavorite, toggleFavorite } = useFavorites()

const isFav = computed(() => props.repo?.id != null && isFavorite(props.repo.id))

const handleClick = () => {
  if (props.repo) toggleFavorite(props.repo)
}
</script>
