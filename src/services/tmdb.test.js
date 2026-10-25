import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { fetchMetadataFromTMDB, clearMetadataCache } from "./tmdb.js"

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
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down"))),
    )

    const result = await fetchMetadataFromTMDB(["Inception"])

    expect(result.rawResults).toEqual([null])
    expect(result.platforms.counts).toEqual({})
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
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResponse({ status_message: "Invalid API key" }, 401)),
    )

    await expect(fetchMetadataFromTMDB(["Inception"])).rejects.toThrow(/401/)
  })
})
