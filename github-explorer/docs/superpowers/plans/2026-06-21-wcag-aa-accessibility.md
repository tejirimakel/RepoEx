# WCAG 2.2 AA Accessibility Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the `github-explorer` Vue 3 SPA to WCAG 2.2 Level AA — fixing screen-reader semantics, colour contrast, keyboard/focus, and status announcements.

**Architecture:** Targeted in-place fixes plus two shared units where the same defect is duplicated: a `RepoStat.vue` meta-item component (used by Card + RepoDetail) and a single per-view `role="status"` live region (replacing many duplicate status regions). Only the specific failing Tailwind colour tokens are swapped — no theme overhaul.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Vue Router 5, Tailwind CSS 4 (`sr-only`/`focus:not-sr-only` built-ins), Vitest + @vue/test-utils + happy-dom (already installed).

**Branch:** `a11y-wcag-aa` (already created and checked out).

**Spec:** `docs/superpowers/specs/2026-06-21-wcag-aa-accessibility-design.md`

---

## File Structure

**Create:**
- `src/components/RepoStat.vue` — one repository meta item (icon + sr-only label + value)
- `src/components/RepoStat.test.js` — unit test
- `src/components/Card.test.js` — unit test (real link, no tabindex)

**Modify:**
- `src/style.css` — global `:focus-visible` outline
- `src/components/CardSkeleton.vue` — make decorative (`aria-hidden`)
- `src/components/Card.vue` — real `<router-link>` name, drop tabindex, adopt RepoStat, purple-700
- `src/components/FavBtn.vue` — amber-700 saved state, `aria-hidden` star
- `src/components/retryBtn.vue` — `aria-hidden` svg
- `src/components/SearchBar.vue` — `role="search"`, clear-button contrast + hit area
- `src/components/Navbar.vue` — skip link, `aria-controls`, toggle hit area
- `src/views/Home.vue` — single live region, select labels, `#main`
- `src/views/RepoDetail.vue` — RepoStat, single live region, `#main`
- `src/views/Favorite.vue` — red-700, `role="alert"` confirm + focus, `#main`
- `src/views/NotFound.vue` — `#main`

**Verification baseline:** all existing tests pass today (`npx vitest run` → 20 passed). Keep them green.

---

## Task 1: Global focus-visible outline

**Files:**
- Modify: `src/style.css` (append after the existing `:root`/`body` rules)

- [ ] **Step 1: Add the focus-visible rule**

Append to `src/style.css`:

```css
/* Keyboard-focus safety net — visible, ≥3:1 indicator in light and dark.
   WCAG 2.4.7 (Focus Visible) & 2.4.11 (Focus Appearance). */
:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 2px;
}
```

- [ ] **Step 2: Verify the dev build compiles the CSS**

Run: `npx vite build`
Expected: build succeeds, `dist/assets/*.css` emitted, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "a11y: add global :focus-visible outline (WCAG 2.4.7)"
```

---

## Task 2: RepoStat shared component

**Files:**
- Create: `src/components/RepoStat.vue`
- Test: `src/components/RepoStat.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/RepoStat.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/RepoStat.test.js`
Expected: FAIL — cannot resolve `./RepoStat.vue`.

- [ ] **Step 3: Create the component**

Create `src/components/RepoStat.vue`:

```vue
<template>
  <span class="flex items-center gap-1">
    <span aria-hidden="true">{{ icon }}</span>
    <span class="sr-only">{{ label }}: </span>
    <span>{{ value }}</span>
  </span>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
})
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/RepoStat.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/RepoStat.vue src/components/RepoStat.test.js
git commit -m "a11y: add RepoStat meta-item component with sr-only labels"
```

---

## Task 3: Make CardSkeleton decorative

**Files:**
- Modify: `src/components/CardSkeleton.vue:1-6`

- [ ] **Step 1: Replace the status attributes with aria-hidden**

In `src/components/CardSkeleton.vue`, change the root `<div>` opening tag from:

```html
  <div
    role="status"
    aria-label="Loading repository"
    class="p-4 border border-gray-200 rounded-xl shadow-sm animate-pulse bg-white dark:bg-neutral-900 dark:border-neutral-700"
  >
```

to:

```html
  <div
    aria-hidden="true"
    class="p-4 border border-gray-200 rounded-xl shadow-sm animate-pulse bg-white dark:bg-neutral-900 dark:border-neutral-700"
  >
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `npx vitest run`
Expected: PASS (no test asserts CardSkeleton's role).

- [ ] **Step 3: Commit**

```bash
git add src/components/CardSkeleton.vue
git commit -m "a11y: make CardSkeleton decorative (single live region replaces it)"
```

---

## Task 4: Card — real link, no nested-interactive, RepoStat, contrast

**Files:**
- Modify: `src/components/Card.vue`
- Test: `src/components/Card.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/Card.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Card.test.js`
Expected: FAIL — current Card has no router-link (name is plain `<h2>`) and the article has `tabindex="0"`.

- [ ] **Step 3: Rewrite Card.vue**

Replace the entire contents of `src/components/Card.vue` with:

```vue
<template>
  <article
    class="group p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer bg-white flex flex-col justify-between dark:bg-neutral-800 dark:border-neutral-800"
    @click="goToDetail"
  >
    <div>
      <h2 class="text-lg font-semibold">
        <router-link
          :to="detailPath"
          class="group-hover:text-purple-700 transition focus:outline-none"
        >
          {{ repo.name }}
        </router-link>
      </h2>
      <p class="text-sm text-gray-500">
        by <span class="text-purple-700">{{ repo.owner?.login }}</span>
      </p>

      <p class="text-neutral-600 mt-2 line-clamp-2 dark:text-neutral-400">
        {{ repo.description || "No description available." }}
      </p>
    </div>

    <div class="mt-4 flex items-center justify-between gap-3">
      <div class="flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <RepoStat icon="⭐" label="Stars" :value="formatStars(repo.stargazers_count)" />
        <RepoStat icon="💻" label="Language" :value="repo.language || 'N/A'" />
        <RepoStat icon="🕒" label="Last updated" :value="formatDate(repo.updated_at)" />
      </div>

      <FavBtn :repo="repo" @click.stop />
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import FavBtn from "./FavBtn.vue"
import RepoStat from "./RepoStat.vue"
import { formatDate, formatStars } from "../utils/format"

const props = defineProps({
  repo: Object,
})

const router = useRouter()

const detailPath = computed(() => {
  const fullName = props.repo?.full_name
  if (!fullName) return "/"
  const [owner, name] = fullName.split("/")
  return `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`
})

// Progressive enhancement: clicking anywhere on the card navigates, except on
// the inner link/button (which handle themselves). Keyboard + screen-reader
// users use the real <router-link> above; the article has no tabindex/role.
const goToDetail = (e) => {
  if (e.target.closest("a, button")) return
  if (props.repo?.full_name) router.push(detailPath.value)
}
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Card.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Card.vue src/components/Card.test.js
git commit -m "a11y: Card uses real router-link, RepoStat, AA contrast (WCAG 4.1.2, 1.4.3)"
```

---

## Task 5: FavBtn — contrast + decorative star

**Files:**
- Modify: `src/components/FavBtn.vue:2-10`
- Test: `src/components/FavBtn.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/components/FavBtn.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/FavBtn.test.js`
Expected: FAIL — star has no `aria-hidden`, saved class uses `bg-yellow-500`.

- [ ] **Step 3: Update FavBtn.vue**

In `src/components/FavBtn.vue`, change the `:class` binding (line ~4-6) from:

```
    :class="isFav
      ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 hover:border-yellow-600'
      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900'" :aria-pressed="isFav"
```

to:

```
    :class="isFav
      ? 'bg-amber-700 text-white border-amber-700 hover:bg-amber-800 hover:border-amber-800'
      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900'" :aria-pressed="isFav"
```

Then change the star `<span>` (line ~8) from:

```
    <span class="text-base transition-transform duration-200" :class="isFav ? 'scale-110' : ''">
```

to:

```
    <span aria-hidden="true" class="text-base transition-transform duration-200" :class="isFav ? 'scale-110' : ''">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/FavBtn.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/FavBtn.vue src/components/FavBtn.test.js
git commit -m "a11y: FavBtn AA contrast (amber-700) + decorative star (WCAG 1.4.3, 1.1.1)"
```

---

## Task 6: retryBtn — hide decorative svg

**Files:**
- Modify: `src/components/retryBtn.vue:5`

- [ ] **Step 1: Add aria-hidden to the svg**

In `src/components/retryBtn.vue`, change the `<svg ...>` opening tag from:

```html
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
```

to:

```html
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
```

- [ ] **Step 2: Verify build**

Run: `npx vitest run`
Expected: all PASS (no regression).

- [ ] **Step 3: Commit**

```bash
git add src/components/retryBtn.vue
git commit -m "a11y: hide decorative retry svg from screen readers (WCAG 1.1.1)"
```

---

## Task 7: SearchBar — search landmark + clear-button contrast/size

**Files:**
- Modify: `src/components/SearchBar.vue:2-5` (form) and `:22-30` (clear button)
- Test: `src/components/SearchBar.test.js` (append one test)

- [ ] **Step 1: Add a failing assertion**

In `src/components/SearchBar.test.js`, add this test inside the existing `describe(...)` block:

```js
  it("exposes a search landmark and an accessible-contrast clear button", async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: "vue" } })
    expect(wrapper.get("form").attributes("role")).toBe("search")
    const clear = wrapper.get("button[aria-label='Clear search']")
    expect(clear.attributes("class")).toContain("text-gray-600")
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/SearchBar.test.js`
Expected: FAIL — form has no `role`, clear button uses `text-gray-400`.

- [ ] **Step 3: Update SearchBar.vue**

Change the `<form>` opening tag from:

```html
  <form
    @submit.prevent="handleSubmit"
    class="flex flex-col sm:flex-row gap-2 w-full"
  >
```

to:

```html
  <form
    role="search"
    @submit.prevent="handleSubmit"
    class="flex flex-col sm:flex-row gap-2 w-full"
  >
```

Change the clear `<button>` from:

```html
      <button
        v-if="localQuery"
        type="button"
        aria-label="Clear search"
        @click="clearSearch"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
      >
        <span aria-hidden="true">✕</span>
      </button>
```

to:

```html
      <button
        v-if="localQuery"
        type="button"
        aria-label="Clear search"
        @click="clearSearch"
        class="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
      >
        <span aria-hidden="true">✕</span>
      </button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/SearchBar.test.js`
Expected: PASS (existing tests + the new one).

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchBar.vue src/components/SearchBar.test.js
git commit -m "a11y: SearchBar search landmark + AA clear-button contrast/size (WCAG 1.3.1, 1.4.11, 2.5.8)"
```

---

## Task 8: Navbar — skip link, aria-controls, toggle hit area

**Files:**
- Modify: `src/components/Navbar.vue:2` (header), `:16-24` (toggle), `:27-31` (menu div)

- [ ] **Step 1: Add the skip link as the first focusable element**

In `src/components/Navbar.vue`, immediately after the opening `<header ...>` tag (line 2) and before `<nav ...>`, insert:

```html
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:border focus:bg-white dark:focus:bg-neutral-900"
    >
      Skip to content
    </a>
```

- [ ] **Step 2: Give the toggle a larger hit area + aria-controls**

Change the toggle `<button>` opening tag from:

```html
      <button
        class="md:hidden text-xl relative z-50"
        :aria-label="isOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
```

to:

```html
      <button
        class="md:hidden text-xl relative z-50 p-2 -mr-2 inline-flex items-center justify-center"
        :aria-label="isOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        @click="isOpen = !isOpen"
      >
```

- [ ] **Step 3: Give the dropdown an id**

Change the mobile menu `<div v-if="isOpen" ...>` opening tag (line ~28) from:

```html
      <div
        v-if="isOpen"
        class="md:hidden px-4 py-4 space-y-2 border-t bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
      >
```

to:

```html
      <div
        v-if="isOpen"
        id="mobile-menu"
        class="md:hidden px-4 py-4 space-y-2 border-t bg-white dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
      >
```

- [ ] **Step 4: Verify build + tests**

Run: `npx vitest run && npx vite build`
Expected: tests PASS, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.vue
git commit -m "a11y: Navbar skip link, aria-controls, larger toggle target (WCAG 2.4.1, 4.1.2, 2.5.8)"
```

---

## Task 9: Home — single live region, select labels, #main

**Files:**
- Modify: `src/views/Home.vue` (template `:2`, `:17`, `:22`, `:37-41`; script `:82-83`)
- Test: `src/views/Home.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/views/Home.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/views/Home.test.js`
Expected: FAIL — multiple/zero `role="status"` (skeletons no longer have it, no live region yet) and `<main>` has no `id`.

- [ ] **Step 3: Update the `<main>` tag**

In `src/views/Home.vue`, change line 2 from:

```html
  <main aria-label="home" class="px-4 md:px-8 lg:px-16 py-6 max-w-7xl mx-auto">
```

to:

```html
  <main id="main" tabindex="-1" aria-label="Repository search" class="px-4 md:px-8 lg:px-16 py-6 max-w-7xl mx-auto">
```

- [ ] **Step 4: Fix the select labels**

Change `aria-label="sort-filters"` (line 17) to `aria-label="Sort repositories"`, and `aria-label="language filters"` (line 22) to `aria-label="Filter by language"`.

- [ ] **Step 5: Add the single live region**

Change the results `<section>` opening (line 37) from:

```html
    <section>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

to:

```html
    <section>

      <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

- [ ] **Step 6: Add the computed status message**

Change the script import line (line 83) from:

```js
import { onMounted, onUnmounted } from "vue"
```

to:

```js
import { computed, onMounted, onUnmounted } from "vue"
```

Then, immediately after the `useSearch()` destructuring block (after the line `} = useSearch()`), add:

```js
const statusMessage = computed(() => {
  if (loading.value) return "Loading repositories…"
  if (isEmptySearch.value) return `No repositories found for ${query.value}`
  if (repos.value.length) return `${repos.value.length} repositories found`
  return ""
})
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/views/Home.test.js`
Expected: PASS (2 tests).

- [ ] **Step 8: Run the full suite**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 9: Commit**

```bash
git add src/views/Home.vue src/views/Home.test.js
git commit -m "a11y: Home single live region, clear select labels, #main (WCAG 4.1.3, 1.3.1, 2.4.1)"
```

---

## Task 10: RepoDetail — RepoStat, live region, #main

**Files:**
- Modify: `src/views/RepoDetail.vue` (template `:2`, `:31-35`; script `:88`, `:91-95`)

- [ ] **Step 1: Update the `<main>` tag**

In `src/views/RepoDetail.vue`, change line 2 from:

```html
  <main aria-label="repo details" class="px-4 md:px-8 py-6 max-w-3xl mx-auto">
```

to:

```html
  <main id="main" tabindex="-1" aria-label="Repository details" class="px-4 md:px-8 py-6 max-w-3xl mx-auto">
```

- [ ] **Step 2: Add the loading live region**

Immediately after the opening `<main ...>` tag, insert as the first child:

```html
    <p class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</p>
```

- [ ] **Step 3: Replace the stat row with RepoStat**

Change the stats block (lines ~31-35) from:

```html
      <div class="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <span><span aria-hidden="true">⭐</span> {{ formatStars(repo.stargazers_count) }}</span>
        <span><span aria-hidden="true">💻</span> {{ repo.language || "N/A" }}</span>
        <span><span aria-hidden="true">🕒</span> {{ formatDate(repo.updated_at) }}</span>
      </div>
```

to:

```html
      <div class="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <RepoStat icon="⭐" label="Stars" :value="formatStars(repo.stargazers_count)" />
        <RepoStat icon="💻" label="Language" :value="repo.language || 'N/A'" />
        <RepoStat icon="🕒" label="Last updated" :value="formatDate(repo.updated_at)" />
      </div>
```

- [ ] **Step 4: Import RepoStat and add the computed status**

Change the import line (line ~88) from:

```js
import { ref, onMounted, onUnmounted } from "vue"
```

to:

```js
import { ref, computed, onMounted, onUnmounted } from "vue"
```

Add to the component imports (after the `RetryBtn` import line ~95):

```js
import RepoStat from "../components/RepoStat.vue"
```

After the reactive state declarations (after `const error = ref(null)`), add:

```js
const statusMessage = computed(() => (loading.value ? "Loading repository…" : ""))
```

- [ ] **Step 5: Verify build + tests**

Run: `npx vitest run && npx vite build`
Expected: tests PASS, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/views/RepoDetail.vue
git commit -m "a11y: RepoDetail RepoStat labels, loading live region, #main (WCAG 1.1.1, 4.1.3)"
```

---

## Task 11: Favorite — AA reds, announced confirm, #main

**Files:**
- Modify: `src/views/Favorite.vue` (template `:2`, `:11-17`, `:20-34`; script `:62-74`)

- [ ] **Step 1: Update the `<main>` tag**

In `src/views/Favorite.vue`, change line 2 from:

```html
  <main aria-label="favorites" class="px-4 md:px-8 lg:px-16 py-6 max-w-7xl mx-auto">
```

to:

```html
  <main id="main" tabindex="-1" aria-label="Favorites" class="px-4 md:px-8 lg:px-16 py-6 max-w-7xl mx-auto">
```

- [ ] **Step 2: Fix the "Clear all" contrast**

Change the "Clear all" button class (line ~14) from:

```html
          class="text-sm text-red-500 hover:underline px-3"
```

to:

```html
          class="text-sm text-red-700 hover:underline px-3 dark:text-red-400"
```

- [ ] **Step 3: Make the confirm an announced alert with the AA red, and focus it**

Change the confirm block (lines ~20-34) from:

```html
      <div v-if="confirmingClear" class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">Remove all?</span>
        <button
          @click="confirmClear"
          class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Yes
        </button>
        <button
          @click="confirmingClear = false"
          class="px-3 py-1 rounded border hover:bg-gray-100 transition dark:hover:bg-neutral-700"
        >
          Cancel
        </button>
      </div>
```

to:

```html
      <div v-if="confirmingClear" role="alert" class="flex items-center gap-2 text-sm">
        <span class="text-gray-700 dark:text-neutral-300">Remove all?</span>
        <button
          ref="yesBtn"
          @click="confirmClear"
          class="px-3 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition"
        >
          Yes
        </button>
        <button
          @click="confirmingClear = false"
          class="px-3 py-1 rounded border hover:bg-gray-100 transition dark:hover:bg-neutral-700"
        >
          Cancel
        </button>
      </div>
```

- [ ] **Step 4: Move focus to the confirm when it opens**

Replace the entire `<script setup>` block (lines ~62-75) with:

```js
import { ref, nextTick, watch } from "vue"
import { useFavorites } from "../composables/useFavorites"
import Card from "../components/Card.vue"

const { favorites, clearFavorites } = useFavorites()

const confirmingClear = ref(false)
const yesBtn = ref(null)

watch(confirmingClear, async (open) => {
  if (open) {
    await nextTick()
    yesBtn.value?.focus()
  }
})

const confirmClear = () => {
  clearFavorites()
  confirmingClear.value = false
}
```

- [ ] **Step 5: Verify build + tests**

Run: `npx vitest run && npx vite build`
Expected: tests PASS, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/views/Favorite.vue
git commit -m "a11y: Favorite AA reds, announced+focused confirm, #main (WCAG 1.4.3, 4.1.3)"
```

---

## Task 12: NotFound — #main for skip link

**Files:**
- Modify: `src/views/NotFound.vue:2`

- [ ] **Step 1: Add id to main**

In `src/views/NotFound.vue`, change line 2 from:

```html
  <main class="flex flex-col items-center justify-center text-center py-24 px-4">
```

to:

```html
  <main id="main" tabindex="-1" class="flex flex-col items-center justify-center text-center py-24 px-4">
```

- [ ] **Step 2: Verify build**

Run: `npx vite build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/views/NotFound.vue
git commit -m "a11y: NotFound #main target for skip link (WCAG 2.4.1)"
```

---

## Task 13: Final verification

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: all PASS (20 original + RepoStat 1 + Card 3 + FavBtn 2 + SearchBar +1 + Home 2 = ~29).

- [ ] **Step 2: Production build**

Run: `npx vite build`
Expected: clean build, all chunks emitted, no unresolved imports.

- [ ] **Step 3: Manual accessibility pass (dev server)**

Run: `npm run dev`, then verify:
- Tab from page top → "Skip to content" appears and jumps focus to `<main>`.
- Keyboard-only: every interactive element shows a visible focus ring; repo card name is reachable and Enter navigates; FavBtn toggles and announces pressed state.
- Contrast spot-check (browser devtools / contrast checker): owner name (purple-700), saved FavBtn (amber-700 + white), "Clear all" + "Yes" (red-700), clear ✕ (gray-600) all meet 4.5:1 text / 3:1 UI.
- Screen reader (VoiceOver): Home announces "{n} repositories found" / "No repositories found"; card and detail stats read as "{value} stars", "Language: {value}", "Last updated: {value}".

- [ ] **Step 4: Update README accessibility notes (optional but recommended)**

Add an "Accessibility" bullet group under Features in `README.md` summarising: skip link, single live regions, AA contrast, real-link cards, RepoStat labels, focus-visible. Commit:

```bash
git add README.md
git commit -m "docs: note WCAG 2.2 AA accessibility features"
```

---

## Self-Review

**Spec coverage:** RepoStat (Task 2) ✓; single live region (Tasks 3, 9, 10) ✓; focus-visible (Task 1) ✓; skip link + #main (Tasks 8, 9, 10, 11, 12) ✓; Card div-as-link + nested interactive + contrast (Task 4) ✓; FavBtn contrast + star (Task 5) ✓; CardSkeleton decorative (Task 3) ✓; Home selects/live region (Task 9) ✓; RepoDetail RepoStat/live region (Task 10) ✓; Navbar aria-controls/target (Task 8) ✓; SearchBar role=search/clear button (Task 7) ✓; Favorite reds/announced confirm (Task 11) ✓; retryBtn svg (Task 6) ✓. All spec items mapped.

**Out of scope (per spec):** SPA route-change announcer, AAA contrast, colour-token theme — not in any task, intentionally.

**Type/name consistency:** `RepoStat` props `icon`/`label`/`value` used identically in Card (Task 4) and RepoDetail (Task 10). `statusMessage` computed defined before use in Home (Task 9) and RepoDetail (Task 10). `yesBtn` ref name consistent in Favorite template + script (Task 11). `detailPath`/`goToDetail` consistent within Card (Task 4).

**Placeholder scan:** no TBD/TODO; every code step shows full code.

