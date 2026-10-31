import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import HighLowGame from "./HighLowGame.jsx"

// Sin barajar, cada carta tiene más estrellas que la anterior: "higher" siempre acierta.
vi.mock("./utils/shuffle.js", () => ({
  shuffle: (items) => [...items],
  seededRandom: () => () => 0,
  randomSeed: () => 1,
}))

const movies = [1, 2, 3].map((n) => ({
  title: `Película ${n}`,
  link: `https://letterboxd.com/film/${n}/`,
  poster: `https://a.ltrbxd.com/${n}.jpg`,
  metrics: { rating: n, popularity: n * 10, year: 2000 + n },
}))

const button = (name) => screen.getByRole("button", { name })
const higher = () => button(/Higher/)
const lower = () => button(/Lower/)

describe("HighLowGame", () => {
  it("espera a que el usuario avance tras cada respuesta", () => {
    render(<HighLowGame movies={movies} loading={false} />)
    fireEvent.click(higher())

    expect(screen.getByText("Racha: 1")).toBeInTheDocument()
    expect(higher()).toBeDisabled()
    expect(button("Siguiente")).toHaveFocus()

    fireEvent.click(button("Siguiente"))
    expect(higher()).toBeEnabled()
  })

  it("distingue completar la baraja de perder", () => {
    const { unmount } = render(<HighLowGame movies={movies} loading={false} />)
    fireEvent.click(higher())
    fireEvent.click(button("Siguiente"))
    fireEvent.click(higher())
    fireEvent.click(button("Ver resultado"))

    expect(screen.getByRole("heading", { name: "¡BARAJA COMPLETA!" })).toBeInTheDocument()
    expect(screen.getByText("Racha final: 2")).toBeInTheDocument()
    expect(button("Jugar de nuevo")).toHaveFocus()
    unmount()

    render(<HighLowGame movies={movies} loading={false} />)
    fireEvent.click(lower())
    fireEvent.click(button("Ver resultado"))

    expect(screen.getByRole("heading", { name: "JUEGO TERMINADO" })).toBeInTheDocument()
    expect(screen.getByText("Racha final: 0")).toBeInTheDocument()
  })

  it("avisa que cambiar de categoría reinicia la racha", () => {
    render(<HighLowGame movies={movies} loading={false} />)
    const note = screen.getByText(/reinicia la racha/)

    expect(note).toHaveStyle({ visibility: "hidden" })

    fireEvent.click(higher())
    expect(note).toHaveStyle({ visibility: "visible" })

    fireEvent.click(button("Popularidad"))
    expect(screen.getByText("Racha: 0")).toBeInTheDocument()
    expect(higher()).toBeEnabled()
  })

  it("ignora los atajos mientras está oculto", () => {
    const { rerender } = render(
      <HighLowGame movies={movies} loading={false} active={false} />,
    )

    fireEvent.keyDown(window, { key: "ArrowUp" })
    expect(higher()).toBeEnabled()

    rerender(<HighLowGame movies={movies} loading={false} active />)
    fireEvent.keyDown(window, { key: "ArrowUp" })
    expect(higher()).toBeDisabled()
  })
})
