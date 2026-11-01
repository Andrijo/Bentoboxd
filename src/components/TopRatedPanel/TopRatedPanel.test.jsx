import { describe, it, expect } from "vitest"
import { render, screen, within } from "@testing-library/react"
import TopRatedPanel from "./TopRatedPanel.jsx"

const MOVIES = [
  { rating: 4, genres: ["drama"], directors: ["Ana Ruiz"] },
  { rating: 5, genres: ["drama"], directors: ["Ana Ruiz"] },
]

describe("TopRatedPanel", () => {
  it("pone la foto a los directores y no a los géneros", () => {
    render(<TopRatedPanel movies={MOVIES} photos={{ "Ana Ruiz": "/ana.jpg" }} loading={false} />)

    const directors = screen.getByRole("region", { name: "Directores" })
    const genres = screen.getByRole("region", { name: "Géneros" })

    expect(directors.querySelector("img")).toHaveAttribute("src", "/ana.jpg")
    expect(genres.querySelector("img")).toBeNull()
    expect(within(genres).queryByText("DR")).not.toBeInTheDocument()
  })

  it("muestra las iniciales del director sin foto", () => {
    render(<TopRatedPanel movies={MOVIES} loading={false} />)

    expect(screen.getByText("AR")).toBeInTheDocument()
  })
})
