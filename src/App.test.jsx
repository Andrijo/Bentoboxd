import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import App from "./App.jsx"
import { fetchMetadataFromTMDB } from "./services/tmdb.js"

vi.mock("./services/tmdb.js", () => ({
  fetchMetadataFromTMDB: vi.fn(),
}))

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:letterboxd="https://letterboxd.com" version="2.0"><channel>
  <item>
    <title>Dune, 2021</title>
    <link>https://letterboxd.com/user/film/dune/</link>
    <description><![CDATA[<p>rated</p>]]></description>
    <letterboxd:filmTitle>Dune</letterboxd:filmTitle>
    <letterboxd:filmYear>2021</letterboxd:filmYear>
  </item>
</channel></rss>`

const METADATA = {
  genres: { Drama: 1 },
  directors: {},
  actors: {},
  countries: {},
  platforms: { counts: {}, logos: {} },
  rawResults: [],
}

function search(value) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value } })
  fireEvent.click(screen.getByRole("button", { name: "Generar" }))
}

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, "", "/")
  fetchMetadataFromTMDB.mockReset()
  vi.stubGlobal(
    "fetch",
    vi.fn((url) =>
      Promise.resolve(
        url.includes("/fantasma/")
          ? { ok: false, status: 404 }
          : { ok: true, text: async () => RSS },
      ),
    ),
  )
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("App", () => {
  it("indica qué falta si se busca con el campo vacío", () => {
    render(<App />)

    fireEvent.click(screen.getByRole("button", { name: "Generar" }))

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe un usuario")
    expect(screen.getByRole("textbox")).toHaveFocus()
    expect(fetch).not.toHaveBeenCalled()

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "u" } })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("quita el aviso de campo vacío al elegir un perfil desde fuera del campo", async () => {
    fetchMetadataFromTMDB.mockResolvedValue(METADATA)
    render(<App />)

    fireEvent.click(screen.getByRole("button", { name: "Generar" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Escribe un usuario")

    fireEvent.click(screen.getByRole("button", { name: /Probar con/ }))
    await screen.findByRole("heading", { name: "TOP GÉNEROS" })

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("conserva el perfil si la siguiente búsqueda falla y no ofrece reintentar", async () => {
    fetchMetadataFromTMDB.mockResolvedValue(METADATA)
    render(<App />)

    search("user")
    await screen.findByRole("heading", { name: "TOP GÉNEROS" })

    search("fantasma")
    const alert = await screen.findByRole("alert")

    expect(alert).toHaveTextContent("No encontramos a @fantasma")
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument()
    expect(screen.getByText("Dune")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "TOP GÉNEROS" })).toBeInTheDocument()
  })

  it("muestra un solo aviso si TMDB falla y permite reintentar", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    fetchMetadataFromTMDB
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(METADATA)
    render(<App />)

    search("user")
    const alerts = await screen.findAllByRole("alert")

    expect(alerts).toHaveLength(1)
    expect(screen.queryByText(/Califica algunas películas/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
    expect(screen.getByRole("heading", { name: "TOP GÉNEROS" })).toBeInTheDocument()
    consoleError.mockRestore()
  })

  it("avisa de un fallo parcial de TMDB y permite reintentar", async () => {
    fetchMetadataFromTMDB
      .mockResolvedValueOnce({
        ...METADATA,
        coverage: { total: 2, matched: 1, failed: 1 },
      })
      .mockResolvedValueOnce({
        ...METADATA,
        coverage: { total: 2, matched: 2, failed: 0 },
      })
    render(<App />)

    search("user")
    const alert = await screen.findByRole("alert")

    expect(alert).toHaveTextContent(
      "Estadísticas basadas en 1 de 2 películas: TMDB no respondió para 1.",
    )

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
    expect(fetchMetadataFromTMDB).toHaveBeenCalledTimes(2)
  })

  it("explica sin alarmar ni ofrecer reintento las películas que TMDB no tiene", async () => {
    fetchMetadataFromTMDB.mockResolvedValue({
      ...METADATA,
      coverage: { total: 2, matched: 1, failed: 0 },
    })
    render(<App />)

    search("user")

    expect(await screen.findByText(/el resto no aparece en TMDB/)).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument()
  })

  it("no menciona la cobertura si TMDB encontró todas las películas", async () => {
    fetchMetadataFromTMDB.mockResolvedValue({
      ...METADATA,
      coverage: { total: 1, matched: 1, failed: 0 },
    })
    render(<App />)

    search("user")
    await screen.findByRole("heading", { name: "TOP GÉNEROS" })

    expect(screen.queryByText(/Estadísticas basadas en/)).not.toBeInTheDocument()
  })

  it("empareja cada entrada con su película por ID, no por título", async () => {
    const rssWithId = RSS.replace(
      'xmlns:letterboxd="https://letterboxd.com"',
      'xmlns:letterboxd="https://letterboxd.com" xmlns:tmdb="https://themoviedb.org"',
    ).replace("</item>", "<tmdb:movieId>438631</tmdb:movieId></item>")
    fetch.mockImplementation(() =>
      Promise.resolve({ ok: true, text: async () => rssWithId }),
    )
    fetchMetadataFromTMDB.mockResolvedValue({
      ...METADATA,
      rawResults: [
        { title: "Dune", queryYear: 2021, tmdbId: 1, runtime: 11 },
        { title: "Dune", queryYear: 2021, tmdbId: 438631, runtime: 155 },
      ],
    })
    render(<App />)

    search("user")

    expect(await screen.findByText("2 h 35 min")).toBeInTheDocument()
    expect(fetchMetadataFromTMDB.mock.calls[0][0]).toEqual([
      { title: "Dune", year: "2021", tmdbId: 438631 },
    ])
  })

  it("recorre los paneles en el mismo orden en que se ven", async () => {
    fetchMetadataFromTMDB.mockResolvedValue(METADATA)
    render(<App />)

    search("user")
    await screen.findByRole("heading", { name: "TOP GÉNEROS" })

    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent)

    expect(titles.indexOf("TOP GÉNEROS")).toBeLessThan(titles.indexOf("STREAMING"))
    expect(titles.indexOf("STREAMING")).toBeLessThan(
      titles.indexOf("OPINIONES IMPOPULARES"),
    )
  })
})
