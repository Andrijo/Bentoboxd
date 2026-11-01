import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import DirectorsPanel from "./DirectorsPanel.jsx"

describe("DirectorsPanel", () => {
  it("muestra solo a quienes tienen 2 películas o más", () => {
    render(<DirectorsPanel directors={{ Ana: 2, Luis: 1 }} movies={[]} loading={false} />)

    expect(screen.getByRole("button", { name: /Ana/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Luis/ })).not.toBeInTheDocument()
    expect(screen.getByText("Con al menos 2 películas")).toBeInTheDocument()
  })

  it("explica por qué no hay ranking si ningún director se repite", () => {
    render(<DirectorsPanel directors={{ Ana: 1, Luis: 1 }} movies={[]} loading={false} />)

    expect(screen.getByText("Ningún director tiene al menos 2 películas en este perfil.")).toBeInTheDocument()
    expect(screen.queryByRole("group", { name: "Vista de directores" })).not.toBeInTheDocument()
  })

  it("distingue la falta de datos", () => {
    render(<DirectorsPanel directors={{}} movies={[]} loading={false} />)

    expect(screen.getByText("Sin datos de directores disponibles")).toBeInTheDocument()
  })
})
