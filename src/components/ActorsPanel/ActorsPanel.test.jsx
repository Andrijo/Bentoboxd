import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import ActorsPanel from "./ActorsPanel.jsx"

describe("ActorsPanel", () => {
  it("muestra el reparto sin selector de vista", () => {
    render(<ActorsPanel actors={{ Ana: 2 }} movies={[]} loading={false} />)

    expect(screen.getByRole("button", { name: /Ana/ })).toBeInTheDocument()
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
  })

  it("distingue la falta de datos", () => {
    render(<ActorsPanel actors={{}} movies={[]} loading={false} />)

    expect(screen.getByText("Sin datos de reparto disponibles")).toBeInTheDocument()
  })
})
