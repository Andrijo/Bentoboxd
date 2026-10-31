import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import SectionNav from "./SectionNav.jsx"

describe("SectionNav", () => {
  it("lleva a la sección y le pasa el foco sin cambiar el hash", () => {
    window.history.replaceState(null, "", "/#quiz")
    render(
      <>
        <SectionNav showTmdbSections />
        <h2 id="rd-panel-generos">TOP GÉNEROS</h2>
      </>,
    )
    const heading = screen.getByRole("heading", { name: "TOP GÉNEROS" })
    heading.scrollIntoView = vi.fn()

    fireEvent.click(screen.getByRole("button", { name: "Géneros" }))

    expect(heading.scrollIntoView).toHaveBeenCalled()
    expect(heading).toHaveFocus()
    expect(window.location.hash).toBe("#quiz")
    window.history.replaceState(null, "", "/")
  })

  it("solo ofrece lo que existe sin datos de TMDB", () => {
    render(<SectionNav showTmdbSections={false} />)

    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Películas",
      "Resumen",
    ])
  })
})
