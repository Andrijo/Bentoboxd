import { describe, it, expect } from "vitest"
import { MAX_STAGGER_MS, staggerDelay } from "./stagger.js"

describe("staggerDelay", () => {
  it("escalona los primeros elementos con el paso indicado", () => {
    expect(staggerDelay(0, 60)).toBe("0ms")
    expect(staggerDelay(3, 60)).toBe("180ms")
  })

  it("no supera el retraso máximo en listas largas", () => {
    expect(staggerDelay(19, 60)).toBe(`${MAX_STAGGER_MS}ms`)
    expect(staggerDelay(49, 100)).toBe(`${MAX_STAGGER_MS}ms`)
  })
})
