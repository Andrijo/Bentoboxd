import { describe, it, expect } from "vitest"
import { useState } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import KeepAlive from "./KeepAlive.jsx"

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Cuenta {count}</button>
}

describe("KeepAlive", () => {
  it("no monta nada antes de la primera visita", () => {
    render(<KeepAlive active={false}><Counter /></KeepAlive>)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("conserva el estado al ocultarse y volver", () => {
    const { rerender, container } = render(<KeepAlive active={false}><Counter /></KeepAlive>)

    rerender(<KeepAlive active><Counter /></KeepAlive>)
    fireEvent.click(screen.getByRole("button"))

    rerender(<KeepAlive active={false}><Counter /></KeepAlive>)
    expect(container.firstChild).toHaveAttribute("hidden")

    rerender(<KeepAlive active><Counter /></KeepAlive>)
    expect(screen.getByRole("button")).toHaveTextContent("Cuenta 1")
  })
})
