// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import handler from "./rss.js"

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
    end() {
      return res
    },
  }
  return res
}

const okFeed = () =>
  vi.fn(async () => ({ ok: true, status: 200, text: async () => "<rss></rss>" }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("api/rss", () => {
  it("sirve el feed sin abrir CORS a cualquier origen", async () => {
    vi.stubGlobal("fetch", okFeed())

    const res = mockRes()
    await handler({ method: "GET", query: { user: "andrijo" } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.headers["Access-Control-Allow-Origin"]).toBeUndefined()
    expect(res.headers["Content-Security-Policy"]).toMatch(/sandbox/)
    expect(res.headers["X-Content-Type-Options"]).toBe("nosniff")
  })

  it("permite solo el origen configurado en RSS_ALLOWED_ORIGIN", async () => {
    vi.stubEnv("RSS_ALLOWED_ORIGIN", "https://app.example")
    vi.stubGlobal("fetch", okFeed())

    const res = mockRes()
    await handler({ method: "GET", query: { user: "andrijo" } }, res)

    expect(res.headers["Access-Control-Allow-Origin"]).toBe("https://app.example")
  })

  it("rechaza usuarios inválidos sin llamar a Letterboxd", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const res = mockRes()
    await handler({ method: "GET", query: { user: "../admin" } }, res)

    expect(res.statusCode).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("responde 429 cuando una IP supera el límite", async () => {
    vi.stubGlobal("fetch", okFeed())
    const req = {
      method: "GET",
      query: { user: "andrijo" },
      headers: { "x-real-ip": "203.0.113.7" },
    }

    let res
    for (let i = 0; i < 21; i += 1) {
      res = mockRes()
      await handler(req, res)
    }

    expect(res.statusCode).toBe(429)
    expect(Number(res.headers["Retry-After"])).toBeGreaterThan(0)
  })
})
