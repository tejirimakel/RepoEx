import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getContributors, getRepo, searchRepos } from "./git"

const makeRes = ({ status = 200, ok = status < 400, body = {}, rateRemaining } = {}) => ({
  status,
  ok,
  headers: { get: (k) => (k === "X-RateLimit-Remaining" ? rateRemaining ?? null : null) },
  json: vi.fn().mockResolvedValue(body),
})

describe("api/git handleResponse", () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns null for 204 No Content without parsing a body", async () => {
    const res = makeRes({ status: 204, ok: true })
    global.fetch.mockResolvedValue(res)

    const result = await getContributors("octocat", "empty")

    expect(result).toBeNull()
    expect(res.json).not.toHaveBeenCalled()
  })

  it("parses JSON for a normal 200 response", async () => {
    global.fetch.mockResolvedValue(makeRes({ body: { name: "vue" } }))
    await expect(getRepo("vuejs", "vue")).resolves.toEqual({ name: "vue" })
  })

  it("throws a rate-limit message on 403 with 0 remaining", async () => {
    global.fetch.mockResolvedValue(makeRes({ status: 403, ok: false, rateRemaining: "0" }))
    await expect(searchRepos("vue")).rejects.toThrow(/rate limit/i)
  })

  it("throws a generic forbidden message on 403 with remaining left", async () => {
    global.fetch.mockResolvedValue(makeRes({ status: 403, ok: false, rateRemaining: "12" }))
    await expect(getContributors("a", "b")).rejects.toThrow(/forbidden/i)
  })

  it("throws on other non-ok responses", async () => {
    global.fetch.mockResolvedValue(makeRes({ status: 422, ok: false }))
    await expect(searchRepos("vue", 101)).rejects.toThrow(/422/)
  })
})
