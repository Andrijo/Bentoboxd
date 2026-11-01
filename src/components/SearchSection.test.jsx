import { describe, it, expect, vi } from "vitest"
import { useState } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import SearchSection from "./SearchSection.jsx"

function renderSearch(props = {}) {
  const handlers = {
    onFetch: vi.fn(),
    onCancel: vi.fn(),
    onProfileSelect: vi.fn(),
    onProfileRemove: vi.fn(),
  }

  function Harness() {
    const [url, setUrl] = useState(props.url ?? "")
    return <SearchSection {...handlers} {...props} url={url} onUrlChange={setUrl} />
  }

  render(<Harness />)
  return handlers
}

describe("SearchSection", () => {
  it("limpia el campo y devuelve el foco sin cambiar de perfil", () => {
    const { onFetch } = renderSearch({ url: "Andrijo" })

    fireEvent.click(screen.getByRole("button", { name: "Limpiar campo" }))

    expect(screen.getByRole("textbox")).toHaveValue("")
    expect(screen.getByRole("textbox")).toHaveFocus()
    expect(onFetch).not.toHaveBeenCalled()
  })

  it("no ofrece limpiar un campo vacío", () => {
    renderSearch()

    expect(screen.queryByRole("button", { name: "Limpiar campo" })).not.toBeInTheDocument()
  })

  it("no ofrece recientes mientras la landing ya los muestra", () => {
    renderSearch({ recentProfiles: ["ana"] })

    expect(screen.queryByRole("button", { name: "Recientes" })).not.toBeInTheDocument()
  })

  it("despliega los recientes y se cierra al elegir uno", () => {
    const { onProfileSelect } = renderSearch({ compact: true, recentProfiles: ["ana"] })
    const toggle = screen.getByRole("button", { name: "Recientes" })

    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("button", { name: "@ana" })).not.toBeInTheDocument()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")

    fireEvent.click(screen.getByRole("button", { name: "@ana" }))

    expect(onProfileSelect).toHaveBeenCalledWith("ana")
    expect(screen.queryByRole("button", { name: "@ana" })).not.toBeInTheDocument()
  })
})
