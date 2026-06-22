const BASE_URL = import.meta.env.VITE_GITHUB_API_URL || "https://api.github.com"
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN

const headers = TOKEN
  ? { Authorization: `Bearer ${TOKEN}` }
  : {}

// GitHub search returns at most 1000 results; at 10 per page that's 100 pages.
export const SEARCH_PER_PAGE = 10
export const SEARCH_RESULT_CAP = 1000
// Contributors shown on the detail page — fetch only what we render.
export const CONTRIBUTORS_LIMIT = 5

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

async function handleResponse(res) {
  if (res.status === 403) {
    const remaining = res.headers.get("X-RateLimit-Remaining")
    if (remaining === "0") {
      throw new Error("GitHub API rate limit reached. Try again in a minute.")
    }
    throw new Error("Access forbidden.")
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  // 204 No Content (e.g. contributors of an empty repo) has no body to parse.
  if (res.status === 204) return null
  return res.json()
}

export async function searchRepos(query, page = 1, signal) {
  const url = buildUrl("/search/repositories", { q: query, page, per_page: SEARCH_PER_PAGE })
  const res = await fetch(url, { headers, signal })
  return handleResponse(res)
}

export async function getRepo(owner, repo, signal) {
  const url = buildUrl(`/repos/${owner}/${repo}`)
  const res = await fetch(url, { headers, signal })
  return handleResponse(res)
}

export async function getContributors(owner, repo, signal) {
  const url = buildUrl(`/repos/${owner}/${repo}/contributors`, { per_page: CONTRIBUTORS_LIMIT })
  const res = await fetch(url, { headers, signal })
  return handleResponse(res)
}
