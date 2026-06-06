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

```bash
npm install
```

---

## 3. Configure environment variables (optional)

Create a `.env` file in the root:

```env
VITE_GITHUB_API_URL=https://api.github.com
```

---

## 4. Run development server

```bash
npm run dev
```

### Optional: GitHub Token

Unauthenticated GitHub API requests are limited to 60 requests/hour. To increase this to 5,000/hour, add a token to a `.env.local` file:

```env
VITE_GITHUB_TOKEN=your_personal_access_token
```

Generate one at [github.com/settings/tokens](https://github.com/settings/tokens) — no scopes needed for public repository access.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:ui` | Run tests with UI |

## Features

- **Search** — Debounced search against the GitHub API with race-condition protection and an in-memory cache (capped at 50 entries)
- **Filters** — Sort results by stars or last updated; filter by programming language
- **Load more** — Paginated results appended in place
- **Repository detail** — Stars, language, last updated, GitHub link, and top contributors with avatars
- **Favourites** — Save/unsave any repository; persisted to `localStorage`; inline confirm before clearing all
- **Skeleton loading** — Placeholder cards shown while data loads
- **404 page** — Catch-all route for unknown URLs
- **Dark mode** — Respects system preference via `color-scheme`

## Project Structure

```text
src/
├── api/
│   └── git.js               GitHub REST API calls (token-aware, AbortController support)
├── composables/
│   ├── useSearch.js          Search state, debounce, pagination, caching
│   └── useFavorites.js       Favourites state synced to localStorage
├── components/
│   ├── Navbar.vue            Sticky header with responsive mobile menu
│   ├── SearchBar.vue         Controlled input with clear button
│   ├── Card.vue              Repository summary card (keyboard-navigable)
│   ├── CardSkeleton.vue      Loading placeholder
│   ├── FavBtn.vue            Toggle favourite button
│   └── ErrorMsg.vue          Accessible error display
├── views/
│   ├── Home.vue              Search page with filters and pagination
│   ├── RepoDetail.vue        Full repository detail and contributors
│   ├── Favorite.vue          Saved repositories list
│   └── NotFound.vue          404 page
└── router/
    └── index.js              Lazy-loaded routes with per-route document titles
```

## Architecture

- **API layer** (`api/git.js`) — All GitHub fetch calls in one place. Reads `VITE_GITHUB_TOKEN` for authenticated requests. Centralises URL encoding and error handling.
- **Composables** — `useSearch` manages all search state (query, results, pagination, cache, race-condition guard). `useFavorites` is a module-level singleton so state is shared across components without a global store.
- **Lazy routing** — Each view is dynamically imported so only the current route's code is loaded.
- **AbortController** — `RepoDetail` cancels in-flight requests when the component unmounts.
- **Accessibility** — `aria-expanded` on the mobile menu toggle, `aria-hidden` on decorative emoji/symbols, `role="status"` on skeleton cards, `role="alert"` on error messages, keyboard navigation (Enter + Space) on interactive cards.
- **Reduced motion** — Shimmer and dropdown animations are gated behind `@media (prefers-reduced-motion: no-preference)`.
