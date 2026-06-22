// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest"
import { ref } from "vue"
import { mount, RouterLinkStub } from "@vue/test-utils"

vi.mock("../composables/useSearch", () => ({
  useSearch: () => ({
    query: ref(""),
    repos: ref([]),
    loading: ref(true),
    error: ref(null),
    hasMore: ref(false),
    sortBy: ref("stars"),
    language: ref(""),
    search: vi.fn(),
    debounceSearch: vi.fn(),
    loadMore: vi.fn(),
    isEmptySearch: ref(false),
    cleanup: vi.fn(),
  }),
}))

import Home from "./Home.vue"

describe("Home accessibility", () => {
  it("renders exactly one status live region while loading", () => {
    const wrapper = mount(Home, {
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    const statusRegions = wrapper.findAll("[role='status']")
    expect(statusRegions).toHaveLength(1)
    expect(statusRegions[0].text()).toContain("Loading")
  })

  it("gives the main landmark an id for the skip link", () => {
    const wrapper = mount(Home, {
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.get("main").attributes("id")).toBe("main")
  })
})
