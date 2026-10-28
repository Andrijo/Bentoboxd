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

  it("suma la duración de las películas que la tienen", () => {
    const stats = computeProfileStats([
      movie({ metrics: { runtime: 148 } }),
      movie({ metrics: { runtime: 92 } }),
      movie({ metrics: { runtime: 0 } }),
      movie({}),
    ])
    expect(stats.runtimeMinutes).toBe(240)
    expect(stats.runtimeCount).toBe(2)
  })

  it("calcula el ritmo semanal y el día favorito con las películas fechadas", () => {
    const stats = computeProfileStats([
      movie({ watchedDate: "2026-10-12" }),
      movie({ watchedDate: "2026-10-17" }),
      movie({ watchedDate: "2026-10-24" }),
      movie({ watchedDate: "2026-10-24" }),
      movie({}),
    ])
    // 12 → 24 de octubre: 13 días, 4 películas fechadas.
    expect(stats.datedCount).toBe(4)
    expect(stats.spanDays).toBe(13)
    expect(stats.perWeek).toBeCloseTo(4 / (13 / 7))
    expect(stats.topWeekday).toBe(6)
    expect(stats.topWeekdayCount).toBe(3)
  })

  it("no infla el ritmo cuando todo ocurre en pocos días", () => {
    const stats = computeProfileStats([
      movie({ watchedDate: "2026-10-25" }),
      movie({ watchedDate: "2026-10-26" }),
    ])
    expect(stats.spanDays).toBe(2)
    expect(stats.perWeek).toBe(2)
  })

  it("desempata el día favorito con el primero de la semana", () => {
    const stats = computeProfileStats([
      movie({ watchedDate: "2026-10-25" }),
      movie({ watchedDate: "2026-10-26" }),
    ])
    // Domingo y lunes empatan en 1: gana el lunes.
    expect(stats.topWeekday).toBe(1)
  })

  it("deja el ritmo vacío si ninguna película tiene fecha", () => {
    const stats = computeProfileStats([movie({}), movie({})])
    expect(stats).toMatchObject({
      datedCount: 0,
      spanDays: 0,
      perWeek: null,
      topWeekday: null,
      topWeekdayCount: 0,
    })
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
