import { describe, it, expect } from "vitest"
import { moviesWith } from "./movieFilters.js"

describe("moviesWith", () => {
  it("devuelve las películas cuyo campo incluye el valor", () => {
    const movies = [
      { title: "A", tmdbId: 1, genres: ["Drama", "Terror"] },
      { title: "B", tmdbId: 2, genres: ["Comedia"] },
      { title: "C", tmdbId: 3 },
    ]

    expect(moviesWith(movies, "genres", "Drama").map((m) => m.title)).toEqual(["A"])
  })

  it("no repite una película vista otra vez, igual que los conteos de TMDB", () => {
    const movies = [
      { title: "Reciente", tmdbId: 1, link: "/2", directors: ["Ana"] },
      { title: "Reciente", tmdbId: 1, link: "/1", directors: ["Ana"] },
      { title: "Sin ID", year: "2020", link: "/3", directors: ["Ana"] },
      { title: "Sin ID", year: "2020", link: "/4", directors: ["Ana"] },
    ]

    expect(moviesWith(movies, "directors", "Ana").map((m) => m.link)).toEqual(["/2", "/3"])
  })

  it("distingue películas homónimas con distinto ID", () => {
    const movies = [
      { title: "Obsession", year: "2025", tmdbId: 1, genres: ["Terror"] },
      { title: "Obsession", year: "2025", tmdbId: 2, genres: ["Terror"] },
    ]

    expect(moviesWith(movies, "genres", "Terror")).toHaveLength(2)
  })
})
