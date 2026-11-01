import { describe, it, expect } from "vitest"
import { MAX_MONTHS, computeMonthlyStats } from "./monthlyStats.js"

describe("computeMonthlyStats", () => {
  it("agrupa por mes de visionado, del más antiguo al más reciente", () => {
    const months = computeMonthlyStats([
      { watchedDate: "2026-02-20", rating: 4 },
      { watchedDate: "2026-02-01", rating: 3 },
      { watchedDate: "2026-01-15", rating: 5 },
    ])

    expect(months).toEqual([
      { key: "2026-01", count: 1, average: 5 },
      { key: "2026-02", count: 2, average: 3.5 },
    ])
  })

  it("incluye los meses sin películas para no acortar el tiempo", () => {
    const months = computeMonthlyStats([
      { watchedDate: "2025-11-30", rating: 4 },
      { watchedDate: "2026-02-01", rating: 3 },
    ])

    expect(months.map((m) => m.key)).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"])
    expect(months[1]).toEqual({ key: "2025-12", count: 0, average: null })
  })

  it("cuenta lo no calificado, pero no lo promedia", () => {
    const months = computeMonthlyStats([
      { watchedDate: "2026-01-01", rating: 4 },
      { watchedDate: "2026-01-02", rating: null },
      { watchedDate: "2026-02-01", rating: null },
    ])

    expect(months[0]).toEqual({ key: "2026-01", count: 2, average: 4 })
    expect(months[1]).toEqual({ key: "2026-02", count: 1, average: null })
  })

  it("ignora las entradas sin fecha", () => {
    expect(computeMonthlyStats([{ watchedDate: null, rating: 4 }])).toEqual([])
    expect(computeMonthlyStats([])).toEqual([])
  })

  it("conserva solo los meses más recientes de un diario muy espaciado", () => {
    const months = computeMonthlyStats([
      { watchedDate: "2020-01-01", rating: 4 },
      { watchedDate: "2026-06-01", rating: 3 },
    ])

    expect(months).toHaveLength(MAX_MONTHS)
    expect(months[months.length - 1].key).toBe("2026-06")
  })
})
