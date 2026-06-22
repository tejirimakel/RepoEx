// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import { useFavorites } from "../composables/useFavorites"
import FavBtn from "./FavBtn.vue"

const repo = { id: 1, name: "vue", full_name: "vuejs/vue", owner: { login: "vuejs" } }

describe("FavBtn accessibility", () => {
  beforeEach(() => {
    useFavorites().clearFavorites()
    localStorage.clear()
  })

  it("hides the decorative star glyph from screen readers", () => {
    const wrapper = mount(FavBtn, { props: { repo } })
    const star = wrapper.get("button > span[aria-hidden='true']")
    expect(["★", "☆"]).toContain(star.text())
  })

  it("uses an AA-contrast amber (not yellow-500) when saved", async () => {
    const wrapper = mount(FavBtn, { props: { repo } })
    await wrapper.get("button").trigger("click")
    const cls = wrapper.get("button").attributes("class")
    expect(cls).toContain("bg-amber-700")
    expect(cls).not.toContain("bg-yellow-500")
  })
})
