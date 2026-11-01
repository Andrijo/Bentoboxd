import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import AppFooter from "./AppFooter.jsx"

describe("AppFooter", () => {
  it("conserva las atribuciones que exigen TMDB y JustWatch", () => {
    render(<AppFooter />)

    expect(screen.getByRole("link", { name: /JustWatch/ })).toHaveAttribute(
      "href",
      "https://www.justwatch.com",
    )
    expect(screen.getByRole("heading", { name: "Créditos" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Logo de TMDB" })).toBeInTheDocument()
    expect(
      screen.getByText("Este producto usa la API de TMDB, pero no está avalado ni certificado por TMDB."),
    ).toBeInTheDocument()
  })

  it("aclara que no es un proyecto oficial de Letterboxd", () => {
    render(<AppFooter />)

    expect(screen.getByRole("contentinfo")).toHaveTextContent("sin relación con Letterboxd")
  })
})
