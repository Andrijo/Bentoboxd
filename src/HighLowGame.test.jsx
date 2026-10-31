import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import HighLowGame from "./HighLowGame.jsx"

const movies = [1, 2, 3, 4, 5, 6].map((n) => ({
  title: `Película ${n}`,
  link: `https://letterboxd.com/film/${n}/`,
  poster: `https://a.ltrbxd.com/${n}.jpg`,
  metrics: { rating: n, popularity: n * 10, year: 2000 + n },
}))

// Con dos cartas cualquier respuesta acaba la partida, sea cual sea el orden.
const twoMovies = movies.slice(0, 2)

const higher = () => screen.getByRole("button", { name: /Higher/ })

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("HighLowGame", () => {
  it("termina la partida después de mostrar el resultado", () => {
    render(<HighLowGame movies={twoMovies} loading={false} />)
    fireEvent.click(higher())

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText("JUEGO TERMINADO")).toBeInTheDocument()
  })

  it("cambiar de categoría cancela el avance pendiente", () => {
    render(<HighLowGame movies={twoMovies} loading={false} />)
    fireEvent.click(higher())
    fireEvent.click(screen.getByRole("button", { name: "Popularidad" }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.queryByText("JUEGO TERMINADO")).not.toBeInTheDocument()
    expect(screen.getByText("Racha: 0")).toBeInTheDocument()
    expect(higher()).toBeEnabled()
  })

  it("ignora los atajos oculto y no deja temporizadores al desmontar", () => {
    const { rerender, unmount } = render(
      <HighLowGame movies={movies} loading={false} active={false} />,
    )

    fireEvent.keyDown(window, { key: "ArrowUp" })
    expect(higher()).toBeEnabled()

    rerender(<HighLowGame movies={movies} loading={false} active />)
    fireEvent.keyDown(window, { key: "ArrowUp" })
    expect(higher()).toBeDisabled()

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
