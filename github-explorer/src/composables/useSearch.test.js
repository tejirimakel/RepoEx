import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../api/git", () => ({
  searchRepos: vi.fn()
}))

import { useSearch } from "../composables/useSearch"
import { searchRepos } from "../api/git"

describe("useSearch", () => {

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it("initializes with default values", () => {
    const { query, repos, loading, error } = useSearch()

    expect(query.value).toBe("")
    expect(repos.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it("fetches repositories successfully", async () => {
    searchRepos.mockResolvedValue({
      items: [{ id: 1, name: "repo1" }],
      total_count: 1
    })

    const { query, repos, debounceSearch } = useSearch()

    query.value = "vue"
    debounceSearch()

    vi.advanceTimersByTime(500)

    await Promise.resolve()

    expect(searchRepos).toHaveBeenCalled()
    expect(repos.value.length).toBe(1)
  })

  it("handles API error", async () => {
    searchRepos.mockRejectedValue(new Error("API failed"))

    const { query, error, debounceSearch } = useSearch()

    query.value = "react"
    debounceSearch()

    vi.advanceTimersByTime(500)
    await Promise.resolve()

    expect(error.value).toBe("API failed")
  })

})