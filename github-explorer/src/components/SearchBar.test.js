// @vitest-environment happy-dom
import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import SearchBar from "./SearchBar.vue"

describe("SearchBar — multi-word query typing", () => {
  it("preserves spaces while typing (does not strip internal/trailing space)", async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: "" } })
    const input = wrapper.get("input")

    input.element.value = "react native"
    await input.trigger("input")

    const emitted = wrapper.emitted("update:modelValue")
    expect(emitted).toBeTruthy()
    expect(emitted.at(-1)[0]).toBe("react native")
  })

  it("strips only leading whitespace on input", async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: "" } })
    const input = wrapper.get("input")

    input.element.value = "   vue"
    await input.trigger("input")

    expect(wrapper.emitted("update:modelValue").at(-1)[0]).toBe("vue")
  })

  it("does not clobber an in-progress trailing space when the parent echoes a trimmed value", async () => {
    // Simulates the parent binding the trimmed search value back into modelValue
    // while the user has typed a trailing space mid-phrase.
    const wrapper = mount(SearchBar, { props: { modelValue: "react" } })
    const input = wrapper.get("input")

    input.element.value = "react "
    await input.trigger("input")
    // Parent reflects the trimmed value back down.
    await wrapper.setProps({ modelValue: "react" })

    expect(input.element.value).toBe("react ")
  })

  it("trims to a clean value on submit", async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: "" } })
    const input = wrapper.get("input")

    input.element.value = "vue "
    await input.trigger("input")
    await wrapper.get("form").trigger("submit")

    expect(wrapper.emitted("update:modelValue").at(-1)[0]).toBe("vue")
    expect(wrapper.emitted("search")).toBeTruthy()
  })

  it("exposes a search landmark and an accessible-contrast clear button", async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: "vue" } })
    expect(wrapper.get("form").attributes("role")).toBe("search")
    const clear = wrapper.get("button[aria-label='Clear search']")
    expect(clear.attributes("class")).toContain("text-gray-600")
  })
})
