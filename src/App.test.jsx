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
