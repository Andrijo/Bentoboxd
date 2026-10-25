// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import handler from "./tmdb.js"
import { buildTmdbUpstreamUrl } from "./_lib/tmdbUpstream.js"

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      res.headers[name] = value
    },
    status(code) {
      res.statusCode = code
      return res
    },
    json(data) {
      res.body = data
      return res
    },
    send(data) {
      res.body = data
      return res
    },
  }
  return res
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("buildTmdbUpstreamUrl", () => {
  it("añade la key a una búsqueda permitida", () => {
    const url = buildTmdbUpstreamUrl(
      "search/movie",
      new URLSearchParams({ query: "Inception", year: "2010", language: "es-MX" }),
      "secret",
    )

    expect(url.origin).toBe("https://api.themoviedb.org")
    expect(url.pathname).toBe("/3/search/movie")
    expect(url.searchParams.get("api_key")).toBe("secret")
    expect(url.searchParams.get("query")).toBe("Inception")
  })

  it("acepta detalles con credits y watch/providers", () => {
    const url = buildTmdbUpstreamUrl(
      "/movie/27205",
      new URLSearchParams({ append_to_response: "credits,watch/providers" }),
      "secret",
    )

    expect(url.pathname).toBe("/3/movie/27205")
  })

  it.each([
    ["account", {}],
    ["movie/abc", {}],
    ["movie/1/images", {}],
    ["search/movie", {}],
    ["search/movie", { query: "x", api_key: "otra" }],
    ["search/movie", { query: "x", year: "20101" }],
    ["movie/1", { append_to_response: "credits,images" }],
  ])("rechaza %s con %o", (path, params) => {
    expect(
      buildTmdbUpstreamUrl(path, new URLSearchParams(params), "secret"),
    ).toBeNull()
  })
})

describe("api/tmdb handler", () => {
  it("reenvía la respuesta de TMDB sin exponer la key", async () => {
    vi.stubEnv("TMDB_API_KEY", "secret")
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => '{"results":[]}',
    }))
    vi.stubGlobal("fetch", fetchMock)

    const res = mockRes()
    await handler(
      { method: "GET", query: { path: "search/movie", query: "Inception" } },
      res,
    )

    expect(res.statusCode).toBe(200)
    expect(res.body).toBe('{"results":[]}')
    expect(res.headers["Cache-Control"]).toMatch(/s-maxage=/)
    expect(fetchMock.mock.calls[0][0].searchParams.get("api_key")).toBe("secret")
  })

  it("responde 401 si falta la key en el servidor", async () => {
    vi.stubEnv("TMDB_API_KEY", "")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const res = mockRes()
    await handler({ method: "GET", query: { path: "search/movie", query: "x" } }, res)

    expect(res.statusCode).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("responde 400 a rutas no permitidas", async () => {
    vi.stubEnv("TMDB_API_KEY", "secret")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const res = mockRes()
    await handler({ method: "GET", query: { path: "account" } }, res)

    expect(res.statusCode).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("propaga Retry-After en un 429", async () => {
    vi.stubEnv("TMDB_API_KEY", "secret")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 429,
        headers: new Headers({ "Retry-After": "2" }),
        text: async () => "{}",
      })),
    )

    const res = mockRes()
    await handler({ method: "GET", query: { path: "movie/1" } }, res)

    expect(res.statusCode).toBe(429)
    expect(res.headers["Retry-After"]).toBe("2")
    expect(res.headers["Cache-Control"]).toBe("no-store")
  })
})
