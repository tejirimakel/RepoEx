# WCAG 2.2 AA Accessibility Remediation — Design

**Date:** 2026-06-21
**App:** `github-explorer/` (Vue 3 + Vite SPA)
**Target:** WCAG 2.2 Level AA
**Output:** Plan + implement

## Context

A prior pass hardened correctness, performance, DRY, and error/loading states. This pass
re-audits the app through an accessibility lens (WCAG 2.2 AA, semantic structure, screen-reader
support, colour contrast). The functional dimensions (caching, skeletons, abort handling,
expensive renders) are already up to par; the remaining gaps are accessibility defects.

**Pages/components already up to par — not changed:** `ErrorMsg.vue` (role="alert",
`bg-red-100`/`text-red-700` ≈ 6.5:1), `NotFound.vue`, router per-route titles, reduced-motion CSS,
`<html lang="en">`, the search debounce/focus handling.

## Approach

Targeted, component-first remediation. Fix each failing AA criterion in place; extract shared
units only where the same a11y defect is duplicated. Swap only the specific failing colour tokens
— no design-system/theme overhaul (rejected as YAGNI for a ~1.2k-line app), no audit-only.

## Shared units (architecture + DRY)

### 1. `components/RepoStat.vue` (new)
One repository meta item rendered consistently with screen-reader context.
- **Props:** `icon` (emoji string), `label` (SR text, e.g. "stars"), `value`.
- **Renders:** `<span aria-hidden="true">{{ icon }}</span>` + `<span class="sr-only">{{ label }}: </span>` + visible value.
- **Consumers:** `Card.vue` and `RepoDetail.vue` meta rows (stars / language / last updated),
  replacing today's duplicated emoji+value markup.
- **WCAG:** 1.1.1 (non-text content), 4.1.2 (name/role/value).

### 2. Single results/loading live region
Replace today's *multiple* `role="status"` skeletons (10 on Home, 3 on RepoDetail) with **one**
`role="status" aria-live="polite"` region per view that announces state in words:
- Loading → "Loading repositories…"
- Loaded → "{n} repositories found"
- Empty → "No repositories found for {query}"

`CardSkeleton.vue` loses its `role="status"`/`aria-label` and becomes `aria-hidden="true"`
(purely decorative). **WCAG:** 4.1.3 (status messages).

### 3. Global `:focus-visible` (in `style.css`)
Add a global keyboard-focus outline as a safety net so every interactive element has a visible,
sufficiently-contrasting focus indicator even where Tailwind resets or `focus:outline-none` apply.
**WCAG:** 2.4.7 (focus visible), 2.4.11 (focus appearance).

### 4. Skip-to-content link
A visually-hidden-until-focused "Skip to content" link as the first focusable element in
`Navbar.vue`, targeting `#main`. Each view's root `<main>` gets `id="main"`.
**WCAG:** 2.4.1 (bypass blocks).

## Per-component changes

### `Card.vue` — highest priority
- **Div-as-link + nested interactive control.** Today `<article tabindex="0" @click @keydown>` is a
  fake link with no role or accessible name, and it *nests* the real `FavBtn` button
  (interactive-in-interactive). Fix: make the **repo name a real `<router-link>`** (the primary
  navigation target); remove the article's `tabindex`, `@click`, and `@keydown`. `FavBtn` becomes a
  normal sibling, no longer inside an interactive ancestor. Optional progressive enhancement: a
  non-essential whole-card click handler that ignores clicks originating from the button — the
  keyboard/SR path is the link. **WCAG:** 4.1.2, 2.1.1.
- **Contrast:** owner name `text-purple-400` (#c084fc ≈ 2:1 on white) → `text-purple-700`. **1.4.3.**
- Adopt `RepoStat` for the meta row.

### `FavBtn.vue`
- **Contrast:** saved state is white text on `bg-yellow-500` (#eab308 ≈ 2:1) → `bg-amber-700` with
  white text (≈ 4.7:1), hover `amber-800`; keep focus ring. **1.4.3.**
- `aria-hidden="true"` on the ★/☆ glyph (the text label "Saved"/"Save" + `aria-label` already
  convey state). **1.1.1.**
- Confirm hit area ≥ 24×24px (current `px-3 py-1.5` + text is ~30px — keep, verify). **2.5.8.**

### `CardSkeleton.vue`
- Remove `role="status"` and `aria-label`; add `aria-hidden="true"`. (See shared unit 2.)

### `Home.vue`
- Add the single results/loading live region (shared unit 2).
- Replace odd select `aria-label`s (`"sort-filters"`, `"language filters"`) with clear labels
  (e.g. `aria-label="Sort repositories"`, `aria-label="Filter by language"`). **1.3.1, 4.1.2.**
- `<main id="main">`; fix the `aria-label="home"` to something meaningful or `aria-labelledby` the h1.

### `RepoDetail.vue`
- Adopt `RepoStat` for the stars/language/updated row (currently emoji+value with no SR label).
  **1.1.1.**
- Single loading live region (shared unit 2); skeletons decorative.
- `<main id="main">`.

### `Navbar.vue`
- Skip-to-content link (shared unit 4).
- Mobile toggle: add `aria-controls="mobile-menu"`; give the dropdown `id="mobile-menu"`. **4.1.2.**
- Ensure the toggle button hit area ≥ 24×24px. **2.5.8.**

### `SearchBar.vue`
- Add `role="search"` to the form. **1.3.1.**
- Clear (✕) button: colour `text-gray-400` (≈ 2.3:1) → `text-gray-600`; ensure ≥ 24×24px hit area.
  **1.4.11, 2.5.8.**

### `Favorite.vue`
- Contrast: `text-red-500` "Clear all" (≈ 3.3:1) → `text-red-700`; white-on-`bg-red-500` "Yes"
  button → `bg-red-700` (≈ 5.2:1), hover `red-800`. **1.4.3.**
- Wrap the inline "Remove all?" confirm in `role="alert"` (and move focus to the "Yes" button) so
  it is announced. **4.1.3.**
- `<main id="main">`.

### `retryBtn.vue`
- `aria-hidden="true"` on the inline SVG (visible "Retry" text already names the button). **1.1.1.**

## Out of scope (YAGNI)
- SPA route-change screen-reader announcer (not AA-required; per-route `<title>` already updates).
- AAA contrast (7:1) and a full semantic colour-token theme.

## Testing & verification
- **Automated:** keep all 20 existing tests green. Add focused DOM tests (happy-dom + Vue Test
  Utils, already installed):
  - `Card` renders a real `<a>`/router-link for the repo name and has **no** `tabindex` on the article.
  - During load, exactly **one** `role="status"` element exists (not one per skeleton).
  - `RepoStat` renders an `sr-only` label alongside the value and `aria-hidden` on the icon.
- **Manual:**
  - Keyboard-only: Tab through Home, RepoDetail, Favorite — skip link works, focus is always
    visible, no keyboard trap, card name is reachable and activatable.
  - Contrast: spot-check the swapped tokens (purple-700, amber-700, red-700, gray-600) against
    their backgrounds for ≥ 4.5:1 (text) / ≥ 3:1 (icons/UI).
  - Screen reader (VoiceOver): Home announces result counts; RepoDetail/Card stats read with labels
    ("1.2k stars"); FavBtn announces pressed state.
- `npm run build` clean.
