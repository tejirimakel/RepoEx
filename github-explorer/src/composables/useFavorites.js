import { ref, watch } from "vue"
//using try and catch to handle potential JSON parsing errors when getting favorites from localstorage.
const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem("favorites")
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error("Failed to parse favorites:", e)
    return []
  }
}

const favorites = ref(getStoredFavorites())

const favoriteIds = ref(new Set(favorites.value.map(f => f.id)))

export function useFavorites() {

// using watch to keep favoriteIds in sync with favorites and to persist changes to localStorage whenever favorites is updated.
  watch(
    favorites,
    (val) => {
     
      favoriteIds.value = new Set(val.map(f => f.id))
      localStorage.setItem("favorites", JSON.stringify(val))
    },
    { deep: true }
  )

  const isFavorite = (id) => {
    return favoriteIds.value.has(id)
  }

  const addFavorite = (repo) => {
    if (isFavorite(repo.id)) return

    const storedData = {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      updated_at: repo.updated_at
    }

    favorites.value.push(storedData)
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