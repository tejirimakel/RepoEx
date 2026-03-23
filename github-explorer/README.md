# GitHub Repository Explorer

## Overview

A modern single-page application built with Vue 3 (Composition API) that allows users to search GitHub repositories, view detailed information, and manage favorites locally.
This project emphasizes clean architecture, performance, scalability, and user experience, aligning with real-world frontend engineering practices.

## Tech Stack

Vue 3
Vue Router
Tailwind CSS
Fetch REST API
Vite
Vitest (unit test)

## Features

### Core Features

* Search GitHub repositories by keyword
* View repository details (metadata + top contributors)
* Save and manage favorite repositories (localStorage)
* Fully responsive design (desktop + mobile)

### Enhanced Features

* Debounced search input (optimized API usage)
* Sorting (by stars or last updated)
* Filtering (by programming language)
* Caching of search results (reduces API calls)
* Pagination with "Load More"
* Smart empty states (search vs filter vs initial)
* Error handling (including API rate limits)

---

## Setup & Run Instructions

## 1. Clone the repository

```bash
git clone github-repo
cd github-repo
```

---

## 2. Install dependencies

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

Visit:

```bash
http://localhost:3000
```

---

## 5. Run tests

```bash
npm run test (for cli)
npm run test:ui (for ui on browser)
```

---

## Key Design & Architectural Decisions

## 1. Composable-Based State Management

Instead of global state libraries, i used Vue composables:

* `useSearch` → handles search, pagination, filtering, caching
* `useFavorites` → manages localStorage favorites

### Why?

* Keeps logic modular and reusable
* Avoids unnecessary complexity

---

## 2. Separation of Concerns

| Layer                | Responsibility         |
| -------------------- | ---------------------- |
| API Layer (`git.js`) | Handles HTTP requests  |
| Composables          | logic & state          |
| Components           | UI rendering           |
| Views                | Pages rendering        |

---

## 3. Performance Consideration

Search input is debounced (500ms) to:

* Reduce API calls
* Improve performance
* Prevent rate limiting

---

## 4. Client-Side Caching

Search results are cached using a `Map`:

```javascript
cacheKey = `${query}_${page}`
```

### Benefits

* Prevents duplicate API requests
* Improves perceived performance

---

## 5. Derived States using computed in vue

Filtering and sorting are implemented using computed values:

### Why

* Avoids mutating raw API data
* Keeps transformations predictable because data is reactive
* Ensures you don't have to manually call a function every time a user changes a filter.

---

## 6. UI State Handling

The app differentiates between:

* No search yet
* No results from API
* No results after filtering

---

## 7. Favorites Persistence Strategy

* Favorites are stored in localStorage.
* Only essential fields are saved.

---

## 8. Error Handling Strategy

* Handles generic API errors
* Detects GitHub rate limiting (403)
* Provides user-friendly feedback
* Includes retry mechanism

---

## Additional Feature

It has a feature to display **top contributors** for each repository inside the details page.

Reason:
I chose contributors because it provides insight into active collaboration
and is more user-friendly than raw issue data.

## Known Limitations

## 1. Client-Side Filtering Only

Filtering (language, sorting) is done after fetching results.

### Trade-off

* Faster UI interaction
* But not ideal for very large datasets

---

## 2. Limited Pagination Depth

GitHub API restricts deep pagination.
Some results do not show, but i can get them if i know the repo name and repo owner from the url.

---

## Trade-offs

| Decision                         | Trade-off
| ----------------------------------------------------------
| Composable state vs global store | Simpler, but less centralized
| Client-side filtering            | Fast UI, but limited scalability
| Debouncing                       | Slight delay vs reduced API load
| Caching in memory                | Fast, but resets on refresh  
| localStorage favorites           | Simple, but not persistent across devices

---

## Testing

Basic unit tests are included using Vitest, focusing on:

* Composable initialization
* State correctness

---

## Author

**Tejiri O. Orlu-Makele**
Frontend Developer | React | Vue | WordPress

---
