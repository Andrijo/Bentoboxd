import { describe, it, expect, vi, afterEach } from "vitest"
import { fetchMetadataFromTMDB } from "./tmdb.js"

function jsonResponse(data) {
  return Promise.resolve({ json: async () => data })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("fetchMetadataFromTMDB", () => {
  it("clasifica géneros, directores, actores, países y plataformas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        if (url.includes("/search/movie")) {
          return jsonResponse({ results: [{ id: 27205, genre_ids: [878] }] })
        }
        return jsonResponse({
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
                flatrate: [
                  { provider_name: "Netflix", logo_path: "/netflix.png" },
                ],
              },
            },
          },
        })
      }),
    )

    const result = await fetchMetadataFromTMDB(["Inception"])

    expect(result.genres["Ciencia Ficción"]).toBe(1)
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
      globalRating: "4.2",
      popularity: 100,
      releaseDate: "2010-07-15",
    })
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
})
