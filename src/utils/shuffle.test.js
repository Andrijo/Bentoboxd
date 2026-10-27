import { describe, it, expect } from "vitest"
import { shuffle, seededRandom } from "./shuffle.js"

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

describe("seededRandom", () => {
  it("repite la secuencia con la misma semilla", () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    const seqA = Array.from({ length: 5 }, a)
    expect(Array.from({ length: 5 }, b)).toEqual(seqA)
    seqA.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    })
  })

  it("baraja sin perder elementos aun con semilla 0", () => {
    const items = [1, 2, 3, 4, 5]
    const result = shuffle(items, seededRandom(0))
    expect(result.toSorted()).toEqual(items)
  })

  it("da órdenes distintos con semillas distintas", () => {
    const items = Array.from({ length: 20 }, (_, i) => i)
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) => shuffle(items, seededRandom(seed)).join()),
    )
    expect(orders.size).toBe(5)
  })
})
