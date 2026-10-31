import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import GenreList from "./GenreList.jsx"

const MOVIES = [
  { title: "Dune", year: "2021", rating: 4.5, link: "https://letterboxd.com/u/film/dune/", tmdbId: 1, genres: ["Drama"] },
  { title: "Up", year: "2009", rating: null, link: "https://letterboxd.com/u/film/up/", tmdbId: 2, genres: ["Comedia"] },
]

describe("GenreList", () => {
  it("despliega las películas del género, enlazadas, y las pliega al repetir", () => {
    render(<GenreList genres={{ Drama: 1, Comedia: 1 }} movieCount={2} movies={MOVIES} />)
    const row = screen.getByRole("button", { name: /Drama/ })

    expect(row).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(row)

    expect(row).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region", { name: "Películas de Drama" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Dune/ })).toHaveAttribute("href", MOVIES[0].link)
    expect(screen.getByText("2021 · 4.5★")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Up/ })).not.toBeInTheDocument()

    fireEvent.click(row)

    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("mantiene abierto un solo género", () => {
    render(<GenreList genres={{ Drama: 1, Comedia: 1 }} movieCount={2} movies={MOVIES} />)

    fireEvent.click(screen.getByRole("button", { name: /Drama/ }))
    fireEvent.click(screen.getByRole("button", { name: /Comedia/ }))

    expect(screen.getAllByRole("region")).toHaveLength(1)
    expect(screen.getByRole("region", { name: "Películas de Comedia" })).toBeInTheDocument()
  })
})
