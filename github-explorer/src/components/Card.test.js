// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest"
import { mount, RouterLinkStub } from "@vue/test-utils"

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }))

import Card from "./Card.vue"

const repo = {
  id: 1,
  name: "vue",
  full_name: "vuejs/vue",
  owner: { login: "vuejs" },
  description: "The Progressive JavaScript Framework",
  stargazers_count: 1000,
  language: "JavaScript",
  updated_at: "2024-01-01T00:00:00Z",
}

const mountCard = () =>
  mount(Card, {
    props: { repo },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

describe("Card accessibility", () => {
  it("links to the repo via a real router-link (not a tabindex div)", () => {
    const wrapper = mountCard()
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.exists()).toBe(true)
    expect(link.props("to")).toBe("/repo/vuejs/vue")
    expect(link.text()).toContain("vue")
  })

  it("does not put tabindex on the article wrapper", () => {
    const wrapper = mountCard()
    expect(wrapper.get("article").attributes("tabindex")).toBeUndefined()
  })

  it("renders meta stats with screen-reader labels", () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain("Stars")
    expect(wrapper.text()).toContain("Language")
  })
})
