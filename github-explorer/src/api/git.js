const BASE_URL = import.meta.env.VITE_GITHUB_API_URL || "https://api.github.com"

export async function searchRepos(query, page = 1, signal) {
  const res = await fetch(
    `${BASE_URL}/search/repositories?q=${query}&page=${page}&per_page=10`, { signal }
  )


   if (res.status === 403) {
   
    throw new Error("Please wait one minute before making more requests. Thank you")
   }

  if (!res.ok) throw new Error("Failed to fetch repositories")

  return res.json()
}

export async function getRepo(owner, repo) {
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}`)
  if (!res.ok) throw new Error("Failed to fetch repositories")
  return res.json()
}

export async function getContributors(owner, repo) {
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contributors`)
  if (!res.ok) throw new Error("Failed to fetch contributors")
  return res.json()
}