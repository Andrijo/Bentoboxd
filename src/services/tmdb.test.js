import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import {
  fetchMetadataFromTMDB,
  clearMetadataCache,
  TMDB_CONCURRENCY,
} from "./tmdb.js"
import { GENRE_KEYS } from "../constants/genres.js"

function jsonResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  })
}

function detailsResponse(overrides = {}) {
  return {
    vote_average: 8.4,
    popularity: 100,
    release_date: "2010-07-15",
    production_countries: [{ iso_3166_1: "US" }],
    credits: {
      crew: [{ job: "Director", name: "Christopher Nolan" }],
      cast: [{ name: "Leonardo DiCaprio" }, { name: "Elliot Page" }],
    },
    "watch/providers": {
      results: {
        MX: {
          flatrate: [{ provider_name: "Netflix", logo_path: "/netflix.png" }],
        },
      },
    },
    ...overrides,
  }
}

beforeEach(() => {
  clearMetadataCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("fetchMetadataFromTMDB", () => {
  it("clasifica todos los géneros, directores, actores, países y plataformas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.includes("/search/movie")) {
          return jsonResponse({
            results: [{ id: 27205, genre_ids: [878, 18] }],
          })
        }
        return jsonResponse(detailsResponse())
      }),
    )

    const result = await fetchMetadataFromTMDB(["Inception"])

    expect(result.genres["Ciencia Ficción"]).toBe(1)
    expect(result.genres["Drama"]).toBe(1)
    expect(result.genres["Terror"]).toBe(0)
    expect(result.directors["Christopher Nolan"]).toBe(1)
    expect(result.actors["Leonardo DiCaprio"]).toBe(1)
    expect(result.actors["Elliot Page"]).toBe(1)
    expect(result.countries["US"]).toBe(1)
    expect(result.platforms.counts["Netflix"]).toBe(1)
    expect(result.platforms.logos["Netflix"]).toBe(
      "https://image.tmdb.org/t/p/w45/netflix.png",
    )
    expect(result.rawResults).toHaveLength(1)
    expect(result.rawResults[0]).toMatchObject({
      title: "Inception",
      genre: "Ciencia Ficción",
      genres: ["Ciencia Ficción", "Drama"],
      directors: ["Christopher Nolan"],
      countries: ["US"],
      globalRating: "4.2",
      popularity: 100,
      releaseDate: "2010-07-15",
    })
  })

  it("usa 'Otro' solo cuando ningún género es conocido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.includes("/search/movie")) {
          return jsonResponse({ results: [{ id: 1, genre_ids: [12, 14] }] })
        }
        return jsonResponse(detailsResponse())
      }),
    )

    const result = await fetchMetadataFromTMDB(["Adventure Movie"])

    expect(result.genres["Otro"]).toBe(1)
    expect(result.genres["Drama"]).toBe(0)
  })

  it("prefiere los géneros de los detalles cuando están disponibles", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.includes("/search/movie")) {
          return jsonResponse({ results: [{ id: 1, genre_ids: [18] }] })
        }
        return jsonResponse(
          detailsResponse({ genres: [{ id: 27 }, { id: 53 }] }),
        )
      }),
    )

    const result = await fetchMetadataFromTMDB(["X"])

    expect(result.genres["Terror"]).toBe(1)
    expect(result.genres["Thriller"]).toBe(1)
    expect(result.genres["Drama"]).toBe(0)
  })

  it("ignora títulos sin resultados en TMDB", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResponse({ results: [] })),
    )

    const result = await fetchMetadataFromTMDB(["Pelicula Inexistente"])

    expect(result.rawResults).toEqual([null])
    expect(result.genres["Otro"]).toBe(0)
    expect(Object.keys(result.directors)).toHaveLength(0)
  })

  it("no rompe si la petición falla", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error("network down")))
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchMetadataFromTMDB(["Inception"])

    expect(result.rawResults).toEqual([null])
    expect(result.platforms.counts).toEqual({})
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("reutiliza la caché entre llamadas", async () => {
    const fetchMock = vi.fn((url) => {
      if (url.includes("/search/movie")) {
        return jsonResponse({ results: [{ id: 1, genre_ids: [18] }] })
      }
      return jsonResponse(detailsResponse())
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchMetadataFromTMDB(["Inception"])
    await fetchMetadataFromTMDB(["Inception"])

    // Solo la primera pasada hace search + details.
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("propaga el AbortError al cancelar la petición", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (url, { signal } = {}) =>
          new Promise((_, reject) => {
            signal?.addEventListener("abort", () => {
              const error = new Error("Aborted")
              error.name = "AbortError"
              reject(error)
            })
          }),
      ),
    )

    const controller = new AbortController()
    const promise = fetchMetadataFromTMDB(["Inception"], {
      signal: controller.signal,
    })
    controller.abort()

    await expect(promise).rejects.toMatchObject({ name: "AbortError" })
  })

  it("propaga un error claro cuando TMDB rechaza la API key (401)", async () => {
    const fetchMock = vi.fn(() =>
      jsonResponse({ status_message: "Invalid API key" }, 401),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(fetchMetadataFromTMDB(["Inception"])).rejects.toThrow(/401/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("incluye el año del RSS en la búsqueda de TMDB", async () => {
    const fetchMock = vi.fn((url) => {
      if (url.includes("/search/movie")) {
        return jsonResponse({
          results: [
            { id: 438631, release_date: "2021-09-15", genre_ids: [878] },
          ],
        })
      }
      return jsonResponse(detailsResponse())
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchMetadataFromTMDB([{ title: "Dune", year: "2021" }])

    expect(fetchMock.mock.calls[0][0]).toContain("year=2021")
    expect(result.rawResults[0]).toMatchObject({
      title: "Dune",
      queryYear: 2021,
    })
  })

  it("reintenta sin año si el filtro no devuelve resultados", async () => {
    const fetchMock = vi.fn((url) => {
      if (url.includes("/search/movie")) {
        if (url.includes("year=2021")) return jsonResponse({ results: [] })
        return jsonResponse({
          results: [
            { id: 438631, release_date: "2021-09-15", genre_ids: [878] },
          ],
        })
      }
      return jsonResponse(detailsResponse())
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchMetadataFromTMDB([{ title: "Dune", year: 2021 }])

    // Búsqueda con año + búsqueda sin año + detalles.
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result.rawResults[0]).not.toBeNull()
    expect(result.rawResults[0].queryYear).toBe(2021)
  })

  it("cuenta todos los directores y países de producción", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.includes("/search/movie")) {
          return jsonResponse({ results: [{ id: 1, genre_ids: [18] }] })
        }
        return jsonResponse(
          detailsResponse({
            credits: {
              crew: [
                { job: "Director", name: "Ana" },
                { job: "Director", name: "Luis" },
                { job: "Writer", name: "Otra" },
              ],
              cast: [],
            },
            production_countries: [
              { iso_3166_1: "US" },
              { iso_3166_1: "GB" },
            ],
          }),
        )
      }),
    )

    const result = await fetchMetadataFromTMDB(["Coproducción"])

    expect(result.directors).toEqual({ Ana: 1, Luis: 1 })
    expect(result.countries).toEqual({ US: 1, GB: 1 })
    expect(result.rawResults[0].directors).toEqual(["Ana", "Luis"])
    expect(result.rawResults[0].countries).toEqual(["US", "GB"])
  })

  it("distingue en la caché títulos iguales con años distintos", async () => {
    const fetchMock = vi.fn((url) => {
      if (url.includes("/search/movie")) {
        return jsonResponse({
          results: [
            { id: 1, release_date: "1984-12-14", genre_ids: [878] },
          ],
        })
      }
      return jsonResponse(detailsResponse())
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchMetadataFromTMDB([{ title: "Dune", year: 1984 }])
    await fetchMetadataFromTMDB([{ title: "Dune", year: 2021 }])

    // Dos búsquedas + dos detalles: la caché no mezcla ambos años.
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it("busca el título completo aunque contenga ' - '", async () => {
    const fetchMock = vi.fn((url) => {
      if (url.includes("/search/movie")) {
        return jsonResponse({
          results: [
            { id: 11, release_date: "1977-05-25", genre_ids: [878] },
          ],
        })
      }
      return jsonResponse(detailsResponse())
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchMetadataFromTMDB([
      { title: "Star Wars: Episode IV - A New Hope", year: 1977 },
    ])

    const searchUrl = new URL(fetchMock.mock.calls[0][0])
    expect(searchUrl.searchParams.get("query")).toBe(
      "Star Wars: Episode IV - A New Hope",
    )
  })

  it("inicializa todos los géneros en cero sin NaN", async () => {
    const result = await fetchMetadataFromTMDB([])

    expect(Object.keys(result.genres)).toEqual(GENRE_KEYS)
    expect(Object.values(result.genres).every(Number.isFinite)).toBe(true)
  })

  it("reintenta con backoff cuando TMDB responde 429", async () => {
    let searchCalls = 0
    const fetchMock = vi.fn((url) => {
      if (url.includes("/search/movie")) {
        searchCalls += 1
        if (searchCalls === 1) {
          return jsonResponse({ status_message: "Rate limited" }, 429)
        }
        return jsonResponse({
          results: [{ id: 1, release_date: "2010-01-01", genre_ids: [18] }],
        })
      }
      return jsonResponse(detailsResponse())
    })
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchMetadataFromTMDB(["Inception"])

    expect(result.rawResults[0]).not.toBeNull()
    expect(searchCalls).toBe(2)
  })

  it("no reintenta errores 4xx no recuperables", async () => {
    const fetchMock = vi.fn(() => jsonResponse({}, 400))
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchMetadataFromTMDB(["Inception"])

    expect(result.rawResults).toEqual([null])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("aborta la petición tras el timeout sin reintentarla", async () => {
    vi.useFakeTimers()

    const fetchMock = vi.fn(
      (url, { signal } = {}) =>
        new Promise((_, reject) => {
          signal?.addEventListener("abort", () => reject(signal.reason))
        }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const promise = fetchMetadataFromTMDB(["Inception"])

    // Un timeout no se reintenta: 6s y la película se descarta.
    await vi.advanceTimersByTimeAsync(6000)

    const result = await promise
    expect(result.rawResults).toEqual([null])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("limita las peticiones concurrentes", async () => {
    let active = 0
    let maxActive = 0

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        active += 1
        maxActive = Math.max(maxActive, active)
        await new Promise((resolve) => setTimeout(resolve, 5))
        active -= 1

        if (url.includes("/search/movie")) {
          return jsonResponse({
            results: [{ id: 1, release_date: "2010-01-01", genre_ids: [18] }],
          })
        }
        return jsonResponse(detailsResponse())
      }),
    )

    const movies = Array.from({ length: 15 }, (_, i) => ({
      title: `Movie ${i}`,
      year: 2010,
    }))

    const result = await fetchMetadataFromTMDB(movies)

    expect(result.rawResults).toHaveLength(15)
    expect(maxActive).toBeLessThanOrEqual(TMDB_CONCURRENCY)
  })
})
