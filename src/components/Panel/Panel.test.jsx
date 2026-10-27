import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Panel from "./Panel.jsx"
import SegmentedControl from "./SegmentedControl.jsx"

describe("Panel", () => {
  it("se etiqueta con su título y muestra el subtítulo y el contenido", () => {
    render(
      <Panel id="rd-panel-demo" area="demo" title="DEMO" subtitle="Detalle">
        <p>Cuerpo</p>
      </Panel>,
    )
    expect(screen.getByRole("region", { name: "DEMO" })).toBeInTheDocument()
    expect(screen.getByText("Detalle")).toBeInTheDocument()
    expect(screen.getByText("Cuerpo")).toBeInTheDocument()
  })

  it("omite el subtítulo cuando es falso", () => {
    render(<Panel id="rd-panel-demo" area="demo" title="DEMO" subtitle={false}>x</Panel>)
    expect(screen.queryByText("Detalle")).not.toBeInTheDocument()
  })
})

describe("SegmentedControl", () => {
  const options = [{ key: "a", label: "A" }, { key: "b", label: "B" }]

  it("marca la opción activa y avisa al cambiar", () => {
    const onChange = vi.fn()
    render(<SegmentedControl label="Vista" options={options} value="a" onChange={onChange} />)
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(screen.getByRole("button", { name: "B" }))
    expect(onChange).toHaveBeenCalledWith("b")
  })
})
