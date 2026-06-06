import { ref, computed, watch } from "vue"

const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem("favorites")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const favorites = ref(getStoredFavorites())
const favoriteIds = computed(() => new Set(favorites.value.map(f => f.id)))

watch(
  favorites,
  (val) => localStorage.setItem("favorites", JSON.stringify(val)),
  { deep: true }
)

export function useFavorites() {
  const isFavorite = (id) => favoriteIds.value.has(id)

  const addFavorite = (repo) => {
    if (isFavorite(repo.id)) return

    favorites.value.push({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      updated_at: repo.updated_at
    })
  }

  const removeFavorite = (id) => {
    favorites.value = favorites.value.filter(repo => repo.id !== id)
  }

  const toggleFavorite = (repo) => {
    if (isFavorite(repo.id)) {
      removeFavorite(repo.id)
    } else {
      addFavorite(repo)
    }
  }

  const clearFavorites = () => {
    favorites.value = []
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    clearFavorites
  }
}
