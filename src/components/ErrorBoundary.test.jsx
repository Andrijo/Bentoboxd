import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import ErrorBoundary from "./ErrorBoundary.jsx"

function Broken() {
  throw new Error("boom")
}

describe("ErrorBoundary", () => {
  it("muestra sus hijos si no hay errores", () => {
    render(<ErrorBoundary><p>Contenido</p></ErrorBoundary>)
    expect(screen.getByText("Contenido")).toBeInTheDocument()
  })

  it("ofrece recargar cuando un hijo falla al renderizar", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    render(<ErrorBoundary><Broken /></ErrorBoundary>)

    expect(screen.getByRole("alert")).toHaveTextContent("Algo salió mal")
    expect(screen.getByRole("button", { name: "Recargar" })).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
