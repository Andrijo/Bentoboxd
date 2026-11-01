import { describe, it, expect } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import GenrePanel from "./GenrePanel.jsx"

// Una película puede tener varios géneros: las etiquetas suman más que las películas.
const genres = { Drama: 27, Comedia: 20, Aventura: 66 }

function renderPanel() {
  render(<GenrePanel genres={genres} movieCount={50} loadingGenres={false} />)
}

describe("GenrePanel", () => {
  it("usa las películas como base del porcentaje en la lista", () => {
    renderPanel()

    const list = screen.getByRole("list", { name: "Géneros por frecuencia" })
    const drama = within(list).getByText("Drama").closest("li")

    expect(drama).toHaveTextContent("54%")
  })

  it("da la misma cifra en todas las vistas", () => {
    renderPanel()

    fireEvent.click(screen.getByRole("img", { name: /^Drama:/ }))
    expect(screen.getByText("54% de las películas")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Matriz" }))
    expect(screen.getByText("Drama: 27 (54%)")).toBeInTheDocument()
  })
})
