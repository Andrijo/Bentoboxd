import { describe, it, expect } from "vitest"
import { computeProfileStats } from "./profileStats.js"

const movie = (overrides) => ({
  title: "X",
  year: "2010",
  rating: null,
  liked: false,
  rewatch: false,
  watchedDate: null,
  ...overrides,
})

describe("computeProfileStats", () => {
  it("resume un feed vacío sin romper", () => {
    const stats = computeProfileStats([])
    expect(stats).toMatchObject({
      total: 0,
      average: null,
      tmdbDiff: null,
      tmdbVerdict: null,
      topDecade: null,
      firstWatched: null,
    })
    expect(stats.distribution).toHaveLength(10)
  })

  it("promedia solo las calificadas y arma la distribución", () => {
    const stats = computeProfileStats([
      movie({ rating: 4 }),
      movie({ rating: 4 }),
      movie({ rating: 2.5 }),
      movie({ rating: null }),
    ])
    expect(stats.ratedCount).toBe(3)
    expect(stats.unratedCount).toBe(1)
    expect(stats.average).toBeCloseTo(3.5)
    expect(stats.distribution.find((d) => d.rating === 4).count).toBe(2)
    expect(stats.distribution.find((d) => d.rating === 2.5).count).toBe(1)
  })

  it("compara contra TMDB solo donde hay ambas calificaciones", () => {
    const stats = computeProfileStats([
      movie({ rating: 4, metrics: { rating: 3.5 } }),
      movie({ rating: 5, metrics: { rating: 4 } }),
      movie({ rating: 3, metrics: { rating: 0 } }),
      movie({ rating: null, metrics: { rating: 4 } }),
    ])
    expect(stats.tmdbCompared).toBe(2)
    expect(stats.tmdbDiff).toBeCloseTo(0.75)
    expect(stats.tmdbVerdict).toBe("kinder")
  })

  it("distingue más exigente y en línea con TMDB", () => {
    expect(
      computeProfileStats([movie({ rating: 2, metrics: { rating: 3.5 } })]).tmdbVerdict,
    ).toBe("harsher")
    expect(
      computeProfileStats([movie({ rating: 3.5, metrics: { rating: 3.45 } })]).tmdbVerdict,
    ).toBe("same")
  })

  it("cuenta me gusta, revisiones, década y rango de fechas", () => {
    const stats = computeProfileStats([
      movie({ year: "1999", liked: true, watchedDate: "2026-03-12" }),
      movie({ year: "2014", rewatch: true, watchedDate: "2026-10-26" }),
      movie({ year: "2011", liked: true, watchedDate: "2026-05-01" }),
      movie({ year: "1994" }),
    ])
    expect(stats.likedCount).toBe(2)
    expect(stats.rewatchCount).toBe(1)
    // Empate 1990s/2010s: gana la más reciente.
    expect(stats.topDecade).toBe(2010)
    expect(stats.topDecadeCount).toBe(2)
    expect(stats.firstWatched).toBe("2026-03-12")
    expect(stats.lastWatched).toBe("2026-10-26")
  })
})
