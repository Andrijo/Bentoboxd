import { describe, it, expect } from "vitest"
import { computeDivergences } from "./divergences.js"

const movie = (title, rating, tmdb) => ({
  title,
  rating,
  metrics: tmdb === undefined ? undefined : { rating: tmdb },
})

describe("computeDivergences", () => {
  it("separa las que subiste y las que bajaste, de mayor a menor diferencia", () => {
    const { above, below, compared } = computeDivergences([
      movie("A", 5, 3.5),
      movie("B", 4, 3.8),
      movie("C", 4.5, 2.5),
      movie("D", 1, 3.5),
      movie("E", 2, 3.5),
    ])

    expect(compared).toBe(5)
    expect(above.map((d) => d.movie.title)).toEqual(["C", "A"])
    expect(below.map((d) => d.movie.title)).toEqual(["D", "E"])
    expect(above[0].diff).toBe(2)
    expect(below[0].diff).toBe(-2.5)
  })

  it("ignora las películas sin calificación tuya o sin dato de TMDB", () => {
    const result = computeDivergences([
      movie("sin nota", null, 3),
      movie("sin tmdb", 5),
      movie("tmdb en cero", 5, 0),
    ])

    expect(result).toEqual({ compared: 0, above: [], below: [] })
  })

  it("descarta diferencias menores a media estrella", () => {
    const { above, below } = computeDivergences([movie("A", 4, 3.6), movie("B", 3, 3.4)])

    expect(above).toEqual([])
    expect(below).toEqual([])
  })

  it("respeta el límite", () => {
    const movies = [1, 2, 3, 4].map((n) => movie(`P${n}`, 5, 1))

    expect(computeDivergences(movies).above).toHaveLength(3)
    expect(computeDivergences(movies, { limit: 2 }).above).toHaveLength(2)
  })

  it("en un empate conserva el orden del feed", () => {
    const { above } = computeDivergences([movie("primera", 5, 3), movie("segunda", 5, 3)])

    expect(above.map((d) => d.movie.title)).toEqual(["primera", "segunda"])
  })
})
