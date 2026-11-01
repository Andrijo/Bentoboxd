import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import DonutChart from "./DonutChart.jsx"

const genres = { Drama: 4, Comedia: 3, Terror: 2, Acción: 1, Otro: 0 }

describe("DonutChart", () => {
  it("muestra el total de películas y no el de etiquetas", () => {
    render(<DonutChart genres={genres} movieCount={6} />)
    expect(screen.getByText("6")).toBeInTheDocument()
    expect(screen.getByText("películas")).toBeInTheDocument()
  })

  it("agrupa los géneros menores en Otro", () => {
    const many = {
      Drama: 9, Comedia: 8, Terror: 7, Acción: 6, Thriller: 5,
      Romance: 4, Animación: 3, Documental: 2, Aventura: 1,
    }
    render(<DonutChart genres={many} movieCount={20} />)
    expect(screen.getAllByRole("img")).toHaveLength(7)
    expect(screen.getByRole("img", { name: "Otro: 6 películas" })).toBeInTheDocument()
  })

  it("revela el detalle al hacer clic en una porción", () => {
    render(<DonutChart genres={genres} movieCount={6} />)
    fireEvent.click(screen.getByRole("img", { name: "Drama: 4 películas" }))
    expect(screen.getByText("67% de las películas")).toBeInTheDocument()
  })
})
