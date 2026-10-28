// @vitest-environment node
import { describe, it, expect } from "vitest"
import { clientIp, createRateLimiter } from "./rateLimit.js"

const fromIp = (ip) => ({ headers: { "x-real-ip": ip } })

describe("clientIp", () => {
  it("prefiere x-real-ip y si no, la primera IP de x-forwarded-for", () => {
    expect(clientIp(fromIp("1.1.1.1"))).toBe("1.1.1.1")
    expect(clientIp({ headers: { "x-forwarded-for": "2.2.2.2, 10.0.0.1" } })).toBe("2.2.2.2")
  })

  it("devuelve null sin cabeceras", () => {
    expect(clientIp({})).toBeNull()
    expect(clientIp(undefined)).toBeNull()
  })
})

describe("createRateLimiter", () => {
  it("corta al pasar el límite y avisa cuándo reintentar", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 60_000 })
    const req = fromIp("1.1.1.1")

    expect(check(req, 0).limited).toBe(false)
    expect(check(req, 1000).limited).toBe(false)
    expect(check(req, 2000)).toEqual({ limited: true, retryAfter: 58 })
  })

  it("reinicia la cuenta al terminar la ventana", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 })
    const req = fromIp("1.1.1.1")

    check(req, 0)
    expect(check(req, 10).limited).toBe(true)
    expect(check(req, 60_000).limited).toBe(false)
  })

  it("cuenta cada IP por separado", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 })

    check(fromIp("1.1.1.1"), 0)
    expect(check(fromIp("2.2.2.2"), 0).limited).toBe(false)
  })

  it("no limita peticiones sin IP identificable", () => {
    const check = createRateLimiter({ limit: 0, windowMs: 60_000 })
    expect(check({}, 0).limited).toBe(false)
  })
})
