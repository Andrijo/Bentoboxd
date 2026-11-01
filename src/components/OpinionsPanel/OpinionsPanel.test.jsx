import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import OpinionsPanel from "./OpinionsPanel.jsx"

const MOVIES = [
  { title: "Alta", link: "/alta", rating: 5, metrics: { rating: 3 } },
  { title: "Baja", link: "/baja", rating: 1, metrics: { rating: 3 } },
]

describe("OpinionsPanel", () => {
  it("explica la regla si hay películas comparadas", () => {
    render(<OpinionsPanel movies={MOVIES} loading={false} />)

    expect(screen.getByText("Cómo se calcula")).toBeInTheDocument()
    expect(screen.getByText(/media estrella de diferencia/)).toBeInTheDocument()
  })

  it("no la muestra sin películas para comparar", () => {
    render(<OpinionsPanel movies={[]} loading={false} />)

    expect(screen.queryByText("Cómo se calcula")).not.toBeInTheDocument()
  })
})
