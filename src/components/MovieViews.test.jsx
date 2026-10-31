import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import MovieViews from "./MovieViews.jsx"

const MOVIES = Array.from({ length: 30 }, (_, i) => ({
  title: `Film ${i + 1}`,
  link: `https://letterboxd.com/u/film/${i + 1}/`,
  year: i < 25 ? "2020" : "1999",
  rating: i % 2 ? 4 : 3,
  liked: i === 28,
}))

const links = () => screen.getAllByRole("link")

function renderViews(movies = MOVIES) {
  render(<MovieViews movies={movies} movieViewMode="timeline" username="ana" onViewModeChange={() => {}} />)
}

describe("MovieViews", () => {
  it("muestra las recientes sin filtros hasta pedir todas", () => {
    renderViews()

    expect(links()).toHaveLength(20)
    expect(screen.getByText("20 de 30 películas recientes")).toBeInTheDocument()
    expect(screen.queryByRole("group", { name: "Filtros de películas" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Ver todas (30)" }))

    expect(links()).toHaveLength(30)
    expect(screen.getByText("30 de 30 películas")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Filtros de películas" })).toBeInTheDocument()
  })

  it("no ofrece «Ver todas» si ya se ven todas", () => {
    renderViews(MOVIES.slice(0, 5))

    expect(screen.queryByRole("button", { name: /Ver todas/ })).not.toBeInTheDocument()
  })

  it("combina filtros y los quita", () => {
    renderViews()
    fireEvent.click(screen.getByRole("button", { name: "Ver todas (30)" }))

    fireEvent.change(screen.getByLabelText("Estreno"), { target: { value: "1999" } })
    expect(links()).toHaveLength(5)

    fireEvent.click(screen.getByRole("button", { name: "Me gusta" }))
    expect(links()).toHaveLength(1)
    expect(screen.getByRole("link", { name: /Film 29/ })).toBeInTheDocument()
    expect(screen.getByText("1 de 30 películas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Quitar filtros" }))
    expect(links()).toHaveLength(30)
  })

  it("explica cuando ninguna película coincide y deja salir de ahí", () => {
    renderViews()
    fireEvent.click(screen.getByRole("button", { name: "Ver todas (30)" }))

    fireEvent.change(screen.getByLabelText("Estreno"), { target: { value: "1999" } })
    fireEvent.change(screen.getByLabelText("Nota"), { target: { value: "4" } })
    fireEvent.click(screen.getByRole("button", { name: "Me gusta" }))

    expect(screen.getByText("Ninguna película coincide con estos filtros.")).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Quitar filtros" })).toBeInTheDocument()
  })

  it("al volver a las recientes quita los filtros y regresa al inicio de la lista", () => {
    Element.prototype.scrollIntoView = vi.fn()
    renderViews()
    fireEvent.click(screen.getByRole("button", { name: "Ver todas (30)" }))
    fireEvent.change(screen.getByLabelText("Estreno"), { target: { value: "1999" } })

    fireEvent.click(screen.getByRole("button", { name: "Ver solo las recientes" }))

    expect(links()).toHaveLength(20)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    delete Element.prototype.scrollIntoView
  })
})
