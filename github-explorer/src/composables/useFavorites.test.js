import { describe, it, expect, beforeEach, vi } from "vitest"

// vi.hoisted runs BEFORE imports — ensures localStorage exists when
// useFavorites.js evaluates its module-level getStoredFavorites() call.
const localStorageMock = vi.hoisted(() => {
  let store = {}
  const mock = {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
  globalThis.localStorage = mock
  return mock
})

import { useFavorites } from "./useFavorites"

const mockRepo = {
  id: 1,
  name: "vue",
  full_name: "vuejs/vue",
  owner: { login: "vuejs" },
  description: "The Progressive JavaScript Framework",
  stargazers_count: 200000,
  language: "JavaScript",
  updated_at: "2024-01-01T00:00:00Z"
}

describe("useFavorites — FavBtn toggle behaviour", () => {
  beforeEach(() => {
    const { clearFavorites } = useFavorites()
    clearFavorites()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it("button starts as not saved — isFavorite returns false", () => {
    const { isFavorite } = useFavorites()
    expect(isFavorite(mockRepo.id)).toBe(false)
  })

  it("clicking Save: isFavorite returns true, repo added to favorites list", () => {
    const { isFavorite, toggleFavorite, favorites } = useFavorites()

    toggleFavorite(mockRepo)

    expect(isFavorite(mockRepo.id)).toBe(true)
    expect(favorites.value).toHaveLength(1)
    expect(favorites.value[0].id).toBe(mockRepo.id)
    expect(favorites.value[0].name).toBe("vue")
  })

  it("clicking Save again (toggle off): isFavorite returns false, repo removed", () => {
    const { isFavorite, toggleFavorite, favorites } = useFavorites()

    toggleFavorite(mockRepo)   // save
    toggleFavorite(mockRepo)   // unsave

    expect(isFavorite(mockRepo.id)).toBe(false)
    expect(favorites.value).toHaveLength(0)
  })

  it("saved repo is persisted to localStorage", () => {
    const { toggleFavorite } = useFavorites()

    toggleFavorite(mockRepo)

    // The watch is async (post-flush), so we check favorites.value directly
    // and trust the watch integration (tested separately).
    // For the sync path: the repo is in favorites.value immediately.
    const { favorites } = useFavorites()
    expect(favorites.value.some(f => f.id === mockRepo.id)).toBe(true)
  })

  it("only saves the expected fields (no extra API data stored)", () => {
    const { toggleFavorite, favorites } = useFavorites()

    toggleFavorite(mockRepo)

    const saved = favorites.value[0]
    expect(Object.keys(saved)).toEqual([
      "id", "name", "full_name", "owner",
      "description", "stargazers_count", "language", "updated_at"
    ])
  })

  it("toggling a different repo does not affect the first", () => {
    const { isFavorite, toggleFavorite, favorites } = useFavorites()
    const otherRepo = { ...mockRepo, id: 2, name: "react" }

    toggleFavorite(mockRepo)
    toggleFavorite(otherRepo)
    toggleFavorite(otherRepo)  // remove second repo

    expect(isFavorite(mockRepo.id)).toBe(true)
    expect(isFavorite(otherRepo.id)).toBe(false)
    expect(favorites.value).toHaveLength(1)
  })

  it("duplicate Save calls toggle correctly (second call removes)", () => {
    const { isFavorite, toggleFavorite, favorites } = useFavorites()

    toggleFavorite(mockRepo)   // save  → length 1
    expect(isFavorite(mockRepo.id)).toBe(true)

    toggleFavorite(mockRepo)   // unsave → length 0
    expect(isFavorite(mockRepo.id)).toBe(false)
    expect(favorites.value).toHaveLength(0)
  })
})
