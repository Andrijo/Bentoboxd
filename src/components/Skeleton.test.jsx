import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { BentoSkeleton, PanelSkeleton } from "./Skeleton.jsx"
import PosterImage from "./PosterImage.jsx"
import { VISIBLE_MOVIES } from "./BentoGrid/bentoPatterns.js"

describe("BentoSkeleton", () => {
  it("renderiza una tarjeta por película visible y anuncia la carga", () => {
    const { container } = render(<BentoSkeleton />)
    const grid = container.querySelector("[style*='grid']")
    expect(grid.children).toHaveLength(VISIBLE_MOVIES)
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Cargando películas…")).toBeInTheDocument()
  })
})

describe("PanelSkeleton", () => {
  it("usa la etiqueta accesible indicada", () => {
    render(<PanelSkeleton variant="chart" label="Clasificando géneros…" />)
    expect(screen.getByText("Clasificando géneros…")).toBeInTheDocument()
  })
})

describe("PosterImage", () => {
  it("muestra shimmer hasta que la imagen carga", () => {
    const { container } = render(<PosterImage src="/p.jpg" alt="Póster" />)
    const img = screen.getByAltText("Póster")
    expect(img).toHaveStyle({ opacity: "0" })
    expect(container.querySelector(".rd-skeleton")).not.toBeNull()

    fireEvent.load(img)

    expect(img).toHaveStyle({ opacity: "1" })
    expect(container.querySelector(".rd-skeleton")).toBeNull()
  })
})
