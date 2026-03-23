# GitHub Repository Explorer

## Overview

A modern single-page application built with Vue 3 (Composition API) that allows users to search GitHub repositories, view detailed information, and manage favorites locally.
This project emphasizes clean architecture, performance, scalability, and user experience, aligning with real-world frontend engineering practices.

## Tech Stack

* Vue 3 (Composition API)
* Vue Router
* Tailwind CSS
* Fetch API (REST)
* Vite
* Vitest (unit test)

## Features

### Core Features

* Search GitHub repositories by keyword
* View repository details (metadata and top contributors)
* Save and manage favorite repositories (localStorage)
* Fully responsive design (desktop + mobile)

### Enhanced Features

* Debounced search input (optimized API usage)
* Sorting (by stars or last updated)
* Filtering (by programming language)
* Client-side caching of search results
* Pagination with "Load More" functionality
* Smart context aware empty states (initial, search, and filtered states)
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

Instead of global state libraries, the application leverages Vue composables:

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
| Views                | Page structure         |

---

## 3. Performance Consideration

The search input is debounced (500ms) to:

* Reduce API calls on every key stroke
* Improve performance
* Prevent rate limiting

---

## 4. Client-Side Caching

Search results are cached using a `Map` with keys derived from query params.

### Benefits

* Improves perceived performance
* Allows me to store and retrieve search results efficiently without making redundant API calls for the same parameters.

---

## 5. Data Structuring using (Set)

This is used for efficient lookups, improving performance in array query using O(1) rather than O(n).

---

## 6. Derived States using computed in vue

Filtering and sorting are implemented using computed values:

### Why

* Prevents mutation of raw API data
* Keeps transformations predictable and reactive
* Ensures you don't have to manually call a function every time a user changes a filter.

---

## 7. UI State Handling

The app clearly differentiates between:

* No search yet (Initial state)
* No results from API
* No results after filtering

---

## 8. Favorites Persistence Strategy

* Favorites are stored in localStorage.
* Only essential fields are saved.

---

## 9. Error Handling Strategy

* Handles generic API errors
* Detects GitHub rate limiting (403)
* Provides user-friendly feedback
* Includes a retry mechanism

---

## 10. Race Condition Handling

Rapid typing in the search input can trigger multiple API requests. To prevent stale data from overwriting newer results:

* Each request is assigned a unique identifier (id)

* Only the latest response updates the UI

### This was done to ensure

* The UI stayed consistent
* To reduce unnecessary Api calls.

---

## 11. UI/UX Decisions

* Skeleton loaders for improved perceived performance
* Responsive grid layout
* Clear empty states for better user guidance
* Retry mechanism for resilience against API errors
* Dark mode support
* Micro-interations and animations

---

## Additional Feature

## Top Contributors

The application displays top contributors for each repository on the details page.

Reason:
This provides meaningful insight into repository activity and collaboration, offering more value than less user-friendly data such as raw issue metrics.

---

## Known Limitations

## 1. Client-Side Filtering

* Filtering and sorting is done after fetching results.
* Language filtering is done on the client

### Trade-off

* Faster UI interaction
* But not ideal for very large datasets

---

## 2. Limited Pagination Depth

* GitHub API restricts deep pagination.
* Some results may not be accessible through pagination alone

---

## Trade-offs

| Decision                         | Trade-off                                |
| -------------------------------- | ---------------------------------------- |
| Composable state vs global store | Simpler, but less centralized            |
| Client-side filtering            | Fast UI, but limited scalability         |
| Debouncing                       | Slight delay vs reduced API load         |
| Caching in memory                | Fast, but resets on refresh              |
| localStorage favorites           | Simple, but not persistent across devices|
| Vitest over Cypress or Jest      | Great for Unit tests, not for E2E testing|

---

## Testing

Basic unit tests are included using Vitest, focusing on:

* Composables initialization
* State management correctness

Testing Approach includes:

* Using a fake Api module from vi.mock to simulate or mock a network request 
* Using fake timers to simulate real setTimeout behaviour.

---

## Author

**Tejiri O. Orlu-Makele**
Frontend Developer | React | Vue | WordPress

---
