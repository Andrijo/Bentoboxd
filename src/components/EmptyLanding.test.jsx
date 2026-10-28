import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import EmptyLanding, { EXAMPLE_PROFILE } from "./EmptyLanding.jsx"

const baseProps = {
  loading: false,
  movies: [],
  error: null,
  recentProfiles: [],
  onProfileSelect: () => {},
}

describe("EmptyLanding", () => {
  it("carga el perfil de ejemplo al pulsar el botón", () => {
    const onProfileSelect = vi.fn()
    render(<EmptyLanding {...baseProps} onProfileSelect={onProfileSelect} />)

    fireEvent.click(screen.getByRole("button", { name: `Probar con @${EXAMPLE_PROFILE}` }))

    expect(onProfileSelect).toHaveBeenCalledWith(EXAMPLE_PROFILE)
  })

  it("con error solo muestra los perfiles recientes", () => {
    render(<EmptyLanding {...baseProps} error="fallo" recentProfiles={["ana"]} />)

    expect(screen.queryByRole("button", { name: /Probar con/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "@ana" })).toBeInTheDocument()
  })

  it("no se muestra mientras carga ni cuando ya hay películas", () => {
    const { container, rerender } = render(<EmptyLanding {...baseProps} loading />)
    expect(container).toBeEmptyDOMElement()

    rerender(<EmptyLanding {...baseProps} movies={[{ link: "x" }]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
