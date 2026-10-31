import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ProfileOverview from "./ProfileOverview.jsx"

const MOVIES = [
  { rating: 4, watchedDate: "2026-01-01", metrics: { rating: 3.5, runtime: 90 } },
  { rating: 3, watchedDate: "2026-01-15", metrics: { rating: 3.5, runtime: 120 } },
]

function stubClipboard(writeText) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  })
}

afterEach(() => {
  delete navigator.clipboard
})

describe("ProfileOverview", () => {
  it("resume el perfil con 4 datos", () => {
    render(<ProfileOverview movies={MOVIES} username="ana" loading={false} />)

    expect(screen.getByRole("heading", { name: "@ana" })).toBeInTheDocument()
    expect(screen.getByText("Promedio").nextSibling).toHaveTextContent("3.5")
    expect(screen.getByText("Tiempo viendo").nextSibling).toHaveTextContent("4 h")
    expect(screen.getByText("Frente al público (TMDB)").nextSibling).toHaveTextContent("0.0")
    expect(screen.getByText("Por semana").nextSibling).toHaveTextContent("0.9")
  })

  it("indica lo que falta por cargar de TMDB", () => {
    render(<ProfileOverview movies={MOVIES} username="ana" loading />)

    expect(screen.getByText("Sumando duraciones…")).toBeInTheDocument()
    expect(screen.getByText("Comparando…")).toBeInTheDocument()
  })

  it("omite lo que depende de TMDB si no hay datos", () => {
    const movies = MOVIES.map(({ rating, watchedDate }) => ({ rating, watchedDate }))
    render(<ProfileOverview movies={movies} username="ana" loading={false} />)

    expect(screen.queryByText("Tiempo viendo")).not.toBeInTheDocument()
    expect(screen.queryByText("Frente al público (TMDB)")).not.toBeInTheDocument()
  })

  it("copia el enlace del perfil y lo confirma", async () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    render(<ProfileOverview movies={MOVIES} username="ana" loading={false} />)

    fireEvent.click(screen.getByRole("button", { name: "Copiar enlace" }))

    expect(await screen.findByRole("button", { name: "Enlace copiado" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Enlace copiado")
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/?user=ana`)
  })

  it("avisa si no se pudo copiar", async () => {
    stubClipboard(vi.fn(() => Promise.reject(new Error("denied"))))
    render(<ProfileOverview movies={MOVIES} username="ana" loading={false} />)

    fireEvent.click(screen.getByRole("button", { name: "Copiar enlace" }))

    expect(await screen.findByRole("button", { name: "No se pudo copiar" })).toBeInTheDocument()
  })
})
