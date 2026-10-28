import { describe, it, expect } from "vitest"
import { computeTopRated } from "./topRated.js"

const movie = (rating, genres, directors = []) => ({ rating, genres, directors })

describe("computeTopRated", () => {
  it("ordena por promedio de tus calificaciones, no por frecuencia", () => {
    const result = computeTopRated(
      [
        movie(2, ["Drama"]),
        movie(3, ["Drama"]),
        movie(2.5, ["Drama"]),
        movie(5, ["Terror"]),
        movie(4.5, ["Terror"]),
      ],
      "genres",
    )

    expect(result.map((r) => r.name)).toEqual(["Terror", "Drama"])
    expect(result[0]).toEqual({ name: "Terror", average: 4.75, count: 2 })
    expect(result[1].count).toBe(3)
  })

  it("exige un mínimo de películas calificadas", () => {
    const movies = [movie(5, ["Terror"]), movie(3, ["Drama"]), movie(4, ["Drama"])]

    expect(computeTopRated(movies, "genres").map((r) => r.name)).toEqual(["Drama"])
    expect(computeTopRated(movies, "genres", { minRated: 1 })).toHaveLength(2)
  })

  it("ignora las películas sin calificar", () => {
    const result = computeTopRated(
      [movie(null, ["Drama"]), movie(0, ["Drama"]), movie(4, ["Drama"])],
      "genres",
    )

    expect(result).toEqual([])
  })

  it("cuenta una película en todos sus géneros y una sola vez por nombre", () => {
    const result = computeTopRated(
      [movie(4, ["Drama", "Drama", "Romance"]), movie(4, ["Drama", "Romance"])],
      "genres",
    )

    expect(result.map((r) => r.count)).toEqual([2, 2])
  })

  it("excluye nombres indicados", () => {
    const movies = [movie(4, ["Otro"]), movie(4, ["Otro"])]

    expect(computeTopRated(movies, "genres", { exclude: ["Otro"] })).toEqual([])
  })

  it("desempata por cantidad de películas y luego por nombre", () => {
    const result = computeTopRated(
      [
        movie(4, [], ["B"]),
        movie(4, [], ["B"]),
        movie(4, [], ["A"]),
        movie(4, [], ["A"]),
        movie(4, [], ["C"]),
        movie(4, [], ["C"]),
        movie(4, [], ["C"]),
      ],
      "directors",
    )

    expect(result.map((r) => r.name)).toEqual(["C", "A", "B"])
  })

  it("respeta el límite y tolera películas sin el campo", () => {
    const movies = [movie(4, ["A", "B", "C"]), movie(4, ["A", "B", "C"]), { rating: 4 }]

    expect(computeTopRated(movies, "genres", { limit: 2 })).toHaveLength(2)
  })
})
