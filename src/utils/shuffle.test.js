import { describe, it, expect } from "vitest"
import { shuffle } from "./shuffle.js"

describe("shuffle", () => {
  it("no muta el arreglo original y conserva los elementos", () => {
    const items = [1, 2, 3, 4, 5]
    const result = shuffle(items)

    expect(items).toEqual([1, 2, 3, 4, 5])
    expect(result.toSorted()).toEqual(items)
  })

  it("reparte las permutaciones de forma uniforme", () => {
    const counts = {}
    const runs = 6000

    for (let i = 0; i < runs; i += 1) {
      const key = shuffle(["a", "b", "c"]).join("")
      counts[key] = (counts[key] || 0) + 1
    }

    // 6 permutaciones, ~1000 cada una.
    expect(Object.keys(counts)).toHaveLength(6)
    Object.values(counts).forEach((count) => {
      expect(count).toBeGreaterThan(800)
      expect(count).toBeLessThan(1200)
    })
  })
})
