# GitHub Explorer

A single-page application built with Vue 3 for searching GitHub repositories, viewing details and contributors, and saving favourites locally.

## Tech Stack

| Tool | Purpose |
|---|---|
| Vue 3 (Composition API) | UI framework |
| Vue Router 5 | Client-side routing with lazy-loaded routes |
| Tailwind CSS 4 | Utility-first styling |
| Vite 8 | Build tool and dev server |
| Vitest | Unit testing |
| GitHub REST API | Data source |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables (optional)

Copy `.env.example` to `.env.local` and adjust as needed:

```env
VITE_GITHUB_API_URL=https://api.github.com
```

### 3. Run the development server

```bash
npm run dev
```

### Optional: GitHub token

Unauthenticated GitHub API requests are limited to 60 requests/hour. To increase this to 5,000/hour, add a token to `.env.local`:

```env
VITE_GITHUB_TOKEN=your_personal_access_token
```

Generate one at [github.com/settings/tokens](https://github.com/settings/tokens) — no scopes needed for public repository access.

> ⚠️ **Token exposure:** Vite inlines `VITE_*` variables into the client bundle at build time, so any token you set here ships to the browser and is publicly readable. Only use a no-scope token, and for a production deployment proxy GitHub requests through a backend rather than exposing a token client-side.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:ui` | Run tests with UI |

## Features

- **Search** — Debounced, multi-word search against the GitHub API with race-condition protection and an in-memory cache (capped at 50 entries)
- **Filters** — Sort results by stars or last updated; filter by programming language
- **Load more** — Paginated results appended in place, capped at GitHub's 1,000-result search ceiling
- **Repository detail** — Stars, language, last updated, GitHub link, a favourite toggle, and top contributors with avatars; the page still renders if contributors fail to load
- **Favourites** — Save/unsave any repository from a card or the detail page; persisted to `localStorage` and synced across browser tabs; inline confirm before clearing all
- **Skeleton loading** — Placeholder cards shown while data loads
- **Resilient errors** — Accessible inline error + retry on every fetch surface, plus a top-level error boundary so an unexpected failure shows a fallback instead of a blank page
- **404 page** — Catch-all route for unknown URLs
- **Dark mode** — Respects system preference via `color-scheme`

## Project Structure

```text
src/
├── api/
│   └── git.js               GitHub REST API calls (token-aware, AbortController, shared limits)
├── composables/
│   ├── useSearch.js          Search state, debounce, pagination, caching
│   └── useFavorites.js       Favourites state synced to localStorage + cross-tab
├── utils/
│   └── format.js             Shared display formatters (formatDate, formatStars)
├── components/
│   ├── Navbar.vue            Sticky header with responsive mobile menu
│   ├── SearchBar.vue         Controlled input with clear button (multi-word safe)
│   ├── Card.vue              Repository summary card (keyboard-navigable)
│   ├── CardSkeleton.vue      Loading placeholder
│   ├── FavBtn.vue            Toggle favourite button
│   ├── ErrorMsg.vue          Accessible error display (role="alert")
│   └── retryBtn.vue          Retry action button
├── views/
│   ├── Home.vue              Search page with filters and pagination
│   ├── RepoDetail.vue        Full repository detail and contributors
│   ├── Favorite.vue          Saved repositories list
│   └── NotFound.vue          404 page
├── router/
│   └── index.js              Lazy-loaded routes with per-route document titles
├── App.vue                  Root shell + onErrorCaptured error boundary
└── main.js                  App bootstrap + global errorHandler
```

Unit tests live next to the code they cover (`*.test.js`): `api/git`, `composables/useSearch`,
`composables/useFavorites`, and `components/SearchBar`.

## Architecture

- **API layer** (`api/git.js`) — All GitHub fetch calls in one place. Reads `VITE_GITHUB_TOKEN` for authenticated requests. Centralises URL encoding, error handling, and shared limits (`SEARCH_PER_PAGE`, `SEARCH_RESULT_CAP`, `CONTRIBUTORS_LIMIT`). `handleResponse` returns `null` for `204 No Content` so empty-repo endpoints don't throw on an empty body.
- **Composables** — `useSearch` manages all search state (query, results, pagination, cache, race-condition guard) and caps pagination at the API's 1,000-result ceiling. `useFavorites` is a module-level singleton so state is shared across components without a global store; writes are guarded and a `storage` listener keeps tabs in sync.
- **Shared formatters** (`utils/format.js`) — `formatDate` and `formatStars` are defined once and reused by `Card` and `RepoDetail`, so dates and (compact) star counts render consistently.
- **Lazy routing** — Each view is dynamically imported so only the current route's code is loaded.
- **AbortController** — `RepoDetail` and `useSearch` cancel in-flight requests on unmount / new search.
- **Resilient fetching** — `RepoDetail` uses `Promise.allSettled`, so a contributors failure degrades to an inline notice instead of failing the whole page. A root `onErrorCaptured` boundary (`App.vue`) plus `app.config.errorHandler` (`main.js`) catch anything unexpected.
- **Accessibility** — `aria-expanded` on the mobile menu toggle, `aria-hidden` on decorative emoji/symbols, `role="status"` on skeleton cards, `role="alert"` on error messages, keyboard navigation (Enter + Space) on interactive cards.
- **Reduced motion** — Shimmer and dropdown animations are gated behind `@media (prefers-reduced-motion: no-preference)`.

## Design Decisions & Trade-offs

- **`localStorage` singleton over a state library (Pinia/Vuex)** — Favourites are shared via a module-level `ref` rather than a store. *Trade-off:* zero dependency and dead-simple at this size, but state lives in a module rather than a devtools-inspectable store and doesn't scale to complex cross-entity state. Revisit if more shared domains appear.
- **Client-side sorting, server-side filtering** — Language filter is pushed into the API query; sort (stars / updated) is applied in a `computed` over the current page set. *Trade-off:* instant re-sort with no network cost, but sorting only orders what's already loaded, not the full result set. Sort is therefore excluded from the cache key.
- **In-memory cache, capped at 50 entries, cleared on new search** — Cheap FIFO eviction keyed by query+page+language. *Trade-off:* speeds up "load more" and back-navigation within a session, but nothing persists across reloads and the cap is a rough bound rather than a memory budget.
- **Hard cap at GitHub's 1,000-result limit** — "Load more" hides at the ceiling. *Trade-off:* avoids a confusing `422` past page 100, at the cost of not surfacing results the API simply won't return anyway.
- **`Promise.allSettled` in `RepoDetail`** — Repo and contributors are fetched independently. *Trade-off:* the page stays useful when contributors 403 (huge repos) or 204 (empty repos), in exchange for slightly more branching than a single `Promise.all`.
- **Cross-tab favourites via the `storage` event** — A second tab adopts the latest persisted value. *Trade-off:* last-write-wins reconciliation (no merge), which is fine for a personal favourites list but would need CRDT-style merging for shared/multi-device data.
- **Client-side token (`VITE_GITHUB_TOKEN`)** — Convenient for raising the rate limit in local/demo use. *Trade-off:* the token ships in the bundle and is public (see the warning above). A production deployment should proxy through a backend and drop the client token entirely.
- **`v-memo` on result cards** — Cards re-render only when `id`/`stargazers_count` change. *Trade-off:* avoids re-rendering the whole grid on unrelated state changes, at the cost of an explicit memo key that must be kept in sync with what the card actually displays.
