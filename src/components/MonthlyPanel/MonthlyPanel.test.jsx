import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import MonthlyPanel from "./MonthlyPanel.jsx"

const MOVIES = [
  { watchedDate: "2026-03-20", rating: 4 },
  { watchedDate: "2026-03-02", rating: 3 },
  { watchedDate: "2026-01-10", rating: 5 },
]

describe("MonthlyPanel", () => {
  it("describe cada mes, incluido el que no tiene películas", () => {
    render(<MonthlyPanel movies={MOVIES} />)

    expect(screen.getByRole("button", { name: "ene 2026: 1 película, nota media 5.0" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "feb 2026: 0 películas, sin nota" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "mar 2026: 2 películas, nota media 3.5" })).toBeInTheDocument()
  })

  it("arranca en el último mes y cambia al enfocar otro", () => {
    render(<MonthlyPanel movies={MOVIES} />)
    const readout = screen.getByRole("figure").querySelector("figcaption")

    expect(readout).toHaveTextContent("2 películas · 3.5★mar 2026")

    fireEvent.focus(screen.getByRole("button", { name: /^ene 2026/ }))
    expect(readout).toHaveTextContent("1 película · 5.0★ene 2026")

    fireEvent.click(screen.getByRole("button", { name: /^feb 2026/ }))
    expect(readout).toHaveTextContent("0 películasfeb 2026")
  })

  it("explica por qué no hay gráfico con un solo mes", () => {
    render(<MonthlyPanel movies={MOVIES.slice(0, 2)} />)

    expect(screen.getByText(/al menos 2 meses/)).toBeInTheDocument()
    expect(screen.queryByRole("figure")).not.toBeInTheDocument()
  })

  it("avisa del corte del feed solo cuando llega al límite", () => {
    const { rerender } = render(<MonthlyPanel movies={MOVIES} />)
    expect(screen.queryByText(/primer mes puede estar incompleto/)).not.toBeInTheDocument()

    const full = Array.from({ length: 50 }, (_, i) => MOVIES[i % MOVIES.length])
    rerender(<MonthlyPanel movies={full} />)
    expect(screen.getByText(/primer mes puede estar incompleto/)).toBeInTheDocument()
  })
})
