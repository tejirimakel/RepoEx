import { ref, computed, watch } from "vue"

const STORAGE_KEY = "favorites"

const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const favorites = ref(getStoredFavorites())
const favoriteIds = computed(() => new Set(favorites.value.map(f => f.id)))

// Guard the write — setItem throws on quota-exceeded or in private-mode
// browsers, which would otherwise leave the watcher with an uncaught error.
let writingFromSync = false
watch(
  favorites,
  (val) => {
    if (writingFromSync) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch {
      // Persistence unavailable — keep working with in-memory state.
    }
  },
  { deep: true }
)

// Keep favorites in sync across tabs without clobbering: when another tab
// writes the key, adopt its value here.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return
    writingFromSync = true
    favorites.value = getStoredFavorites()
    // Release the guard after the watcher has flushed for this change.
    Promise.resolve().then(() => { writingFromSync = false })
  })
}

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
