// @vitest-environment happy-dom
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import RepoStat from "./RepoStat.vue"

describe("RepoStat", () => {
  it("renders an aria-hidden icon, an sr-only label, and the visible value", () => {
    const wrapper = mount(RepoStat, {
      props: { icon: "⭐", label: "Stars", value: "1.2k" },
    })

    const icon = wrapper.get("[aria-hidden='true']")
    expect(icon.text()).toBe("⭐")

    const srLabel = wrapper.get(".sr-only")
    expect(srLabel.text()).toContain("Stars")

    expect(wrapper.text()).toContain("1.2k")
  })
})
