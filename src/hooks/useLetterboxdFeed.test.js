import { describe, it, expect, vi, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useLetterboxdFeed } from "./useLetterboxdFeed.js"

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:letterboxd="https://letterboxd.com" version="2.0">
  <channel>
    <item>
      <title>Inception, 2010 - ★★★★½</title>
      <link>https://letterboxd.com/user/film/inception/</link>
      <description><![CDATA[<p><img src="https://a.ltrbxd.com/inception.jpg" /></p><p><strong>Inception</strong><br>rated</p>]]></description>
      <letterboxd:filmTitle>Inception</letterboxd:filmTitle>
      <letterboxd:filmYear>2010</letterboxd:filmYear>
      <letterboxd:memberRating>4.5</letterboxd:memberRating>
    </item>
    <item>
      <title>Dune, 2021</title>
      <link>https://letterboxd.com/user/film/dune/</link>
      <description><![CDATA[<p><img src="https://a.ltrbxd.com/dune.jpg" /></p><p><strong>Dune</strong><br>rated</p>]]></description>
      <letterboxd:filmTitle>Dune</letterboxd:filmTitle>
      <letterboxd:filmYear>2021</letterboxd:filmYear>
    </item>
  </channel>
</rss>`

const EMPTY_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:letterboxd="https://letterboxd.com" version="2.0"><channel></channel></rss>`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useLetterboxdFeed", () => {
  it("parsea el feed y normaliza el usuario", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, text: async () => RSS }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const { result } = renderHook(() => useLetterboxdFeed())

    await act(async () => {
      await result.current.fetchMovies("https://letterboxd.com/user/")
    })

    expect(fetchMock).toHaveBeenCalledWith("/rss-proxy/user/rss/")
    expect(result.current.username).toBe("user")
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.movies).toHaveLength(2)
    expect(result.current.movies[0]).toMatchObject({
      title: "Inception",
      poster: "https://a.ltrbxd.com/inception.jpg",
      rating: 4.5,
      year: "2010",
    })
    expect(result.current.movies[1]).toMatchObject({
      title: "Dune",
      rating: null,
      year: "2021",
    })
  })

  it("expone un error cuando el feed responde con fallo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false })),
    )

    const { result } = renderHook(() => useLetterboxdFeed())

    await act(async () => {
      await result.current.fetchMovies("user")
    })

    expect(result.current.error).toMatch(/No se pudo obtener el feed/)
    expect(result.current.movies).toEqual([])
  })

  it("expone un error cuando el feed no trae películas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true, text: async () => EMPTY_RSS })),
    )

    const { result } = renderHook(() => useLetterboxdFeed())

    await act(async () => {
      await result.current.fetchMovies("user")
    })

    expect(result.current.error).toMatch(/No se encontraron películas/)
  })

  it("resetFeed limpia el estado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: true, text: async () => RSS })),
    )

    const { result } = renderHook(() => useLetterboxdFeed())

    await act(async () => {
      await result.current.fetchMovies("user")
    })
    expect(result.current.movies).toHaveLength(2)

    act(() => {
      result.current.resetFeed()
    })

    expect(result.current.movies).toEqual([])
    expect(result.current.username).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
