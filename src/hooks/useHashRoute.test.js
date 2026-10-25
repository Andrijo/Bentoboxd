import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useHashRoute } from "./useHashRoute.js"

describe("useHashRoute", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/")
    vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  })

  it("arranca en el perfil sin hash", () => {
    const { result } = renderHook(() => useHashRoute())
    expect(result.current[0]).toBe("profile")
  })

  it("lee la página inicial del hash", () => {
    window.history.replaceState(null, "", "/#quiz")
    const { result } = renderHook(() => useHashRoute())
    expect(result.current[0]).toBe("quiz")
  })

  it("ignora hashes desconocidos", () => {
    window.history.replaceState(null, "", "/#otra-cosa")
    const { result } = renderHook(() => useHashRoute())
    expect(result.current[0]).toBe("profile")
  })

  it("navega actualizando la URL", () => {
    const { result } = renderHook(() => useHashRoute())

    act(() => result.current[1]("higher-lower"))
    expect(result.current[0]).toBe("higher-lower")
    expect(window.location.hash).toBe("#higher-lower")

    act(() => result.current[1]("profile"))
    expect(result.current[0]).toBe("profile")
    expect(window.location.hash).toBe("")
  })

  it("sigue el botón atrás (popstate)", () => {
    const { result } = renderHook(() => useHashRoute())
    act(() => result.current[1]("quiz"))

    act(() => {
      window.history.replaceState(null, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))
    })
    expect(result.current[0]).toBe("profile")
  })
})
