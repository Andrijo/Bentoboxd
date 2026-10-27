import { describe, it, expect, beforeEach } from "vitest"
import { readProfileParam, writeProfileParam } from "./profileUrl.js"

describe("profileUrl", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/")
  })

  it("lee el usuario del query", () => {
    window.history.replaceState(null, "", "/?user=andie#quiz")
    expect(readProfileParam()).toBe("andie")
  })

  it("ignora usuarios ausentes o inválidos", () => {
    expect(readProfileParam()).toBeNull()
    window.history.replaceState(null, "", "/?user=no%20valido")
    expect(readProfileParam()).toBeNull()
  })

  it("escribe el usuario conservando el hash y crea entrada de historial", () => {
    window.history.replaceState(null, "", "/#quiz")
    const before = window.history.length

    writeProfileParam("andie")

    expect(window.location.search).toBe("?user=andie")
    expect(window.location.hash).toBe("#quiz")
    expect(window.history.length).toBe(before + 1)
  })

  it("no duplica la entrada si la URL no cambia", () => {
    writeProfileParam("andie")
    const before = window.history.length
    writeProfileParam("andie")
    expect(window.history.length).toBe(before)
  })

  it("quita el usuario con null, reemplazando la entrada si se pide", () => {
    window.history.replaceState(null, "", "/?user=andie")
    const before = window.history.length

    writeProfileParam(null, { replace: true })

    expect(window.location.search).toBe("")
    expect(window.history.length).toBe(before)
  })
})
