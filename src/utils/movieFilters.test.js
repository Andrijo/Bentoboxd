import { describe, it, expect } from "vitest"
import { NO_FILTERS, filterMovies, filterOptions, moviesWith } from "./movieFilters.js"

const DIARY = [
  { title: "A", year: "2021", rating: 4.5, liked: true },
  { title: "B", year: "2021", rating: 3, liked: false },
  { title: "C", year: "1999", rating: 4.5, liked: false },
  { title: "D", year: "1999", rating: null, liked: true },
]
const titles = (movies) => movies.map((m) => m.title)

describe("filterMovies", () => {
  it("sin filtros deja el diario intacto", () => {
    expect(filterMovies(DIARY, NO_FILTERS)).toEqual(DIARY)
  })

  it("combina me gusta, nota y año", () => {
    expect(titles(filterMovies(DIARY, { ...NO_FILTERS, liked: true }))).toEqual(["A", "D"])
    expect(titles(filterMovies(DIARY, { ...NO_FILTERS, rating: "4.5" }))).toEqual(["A", "C"])
    expect(titles(filterMovies(DIARY, { ...NO_FILTERS, year: "1999" }))).toEqual(["C", "D"])
    expect(titles(filterMovies(DIARY, { liked: true, rating: "4.5", year: "2021" }))).toEqual(["A"])
  })

  it("permite buscar las que no tienen calificación", () => {
    const { ratings } = filterOptions(DIARY)
    const unrated = ratings[ratings.length - 1]

    expect(unrated.label).toBe("Sin calificar")
    expect(titles(filterMovies(DIARY, { ...NO_FILTERS, rating: unrated.value }))).toEqual(["D"])
  })
})

describe("filterOptions", () => {
  it("ofrece solo notas y años presentes, de mayor a menor", () => {
    expect(filterOptions(DIARY)).toEqual({
      ratings: [
        { value: "4.5", label: "4.5★" },
        { value: "3", label: "3★" },
        { value: "unrated", label: "Sin calificar" },
      ],
      years: ["2021", "1999"],
    })
  })

  it("no ofrece «Sin calificar» si todo está calificado", () => {
    const { ratings } = filterOptions(DIARY.filter((m) => m.rating))

    expect(ratings.map((r) => r.value)).toEqual(["4.5", "3"])
  })
})

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
