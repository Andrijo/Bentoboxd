import { describe, it, expect } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import PersonAvatar from "./PersonAvatar.jsx"

function photoOf(container) {
  return container.querySelector("img")
}

describe("PersonAvatar", () => {
  it("muestra la foto y el lugar en el ranking", () => {
    const { container } = render(<PersonAvatar name="Ana Ruiz" photo="/ana.jpg" rank={3} />)

    expect(photoOf(container)).toHaveAttribute("src", "/ana.jpg")
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("deja solo las iniciales si no hay foto", () => {
    const { container } = render(<PersonAvatar name="Ana Ruiz" rank={1} />)

    expect(photoOf(container)).toBeNull()
    expect(screen.getByText("AR")).toBeInTheDocument()
  })

  it("quita la foto que no carga", () => {
    const { container } = render(<PersonAvatar name="Ana Ruiz" photo="/ana.jpg" rank={1} />)

    fireEvent.error(photoOf(container))

    expect(photoOf(container)).toBeNull()
    expect(screen.getByText("AR")).toBeInTheDocument()
  })
})
