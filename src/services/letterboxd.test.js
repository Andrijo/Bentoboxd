import { describe, it, expect } from "vitest"
import {
  parseUsername,
  extractPoster,
  extractRating,
  extractTitle,
} from "./letterboxd.js"

describe("parseUsername", () => {
  it("extrae el usuario de una URL completa de Letterboxd", () => {
    expect(parseUsername("https://letterboxd.com/andrijo/")).toBe("andrijo")
  })

  it("extrae el usuario de una URL sin protocolo", () => {
    expect(parseUsername("letterboxd.com/andrijo/rss/")).toBe("andrijo")
  })

  it("quita el prefijo @ de un nombre de usuario", () => {
    expect(parseUsername("@andrijo")).toBe("andrijo")
  })

  it("recorta espacios y devuelve el usuario tal cual", () => {
    expect(parseUsername("  andrijo  ")).toBe("andrijo")
  })

  it("devuelve cadena vacía para entradas vacías o nulas", () => {
    expect(parseUsername("")).toBe("")
    expect(parseUsername(null)).toBe("")
    expect(parseUsername(undefined)).toBe("")
  })
})

describe("extractPoster", () => {
  it("obtiene la URL del póster desde el HTML de la descripción", () => {
    const desc = '<p><img src="https://a.ltrbxd.com/poster.jpg" /></p>'
    expect(extractPoster(desc)).toBe("https://a.ltrbxd.com/poster.jpg")
  })

  it("devuelve null si no hay imagen", () => {
    expect(extractPoster("<p>sin imagen</p>")).toBeNull()
    expect(extractPoster(undefined)).toBeNull()
  })
})

describe("extractRating", () => {
  it("convierte estrellas llenas a número", () => {
    expect(extractRating("Rated: ★★★★")).toBe(4)
  })

  it("suma media estrella", () => {
    expect(extractRating("Rated: ★★★½")).toBe(3.5)
  })

  it("devuelve null cuando no hay calificación", () => {
    expect(extractRating("sin rating")).toBeNull()
    expect(extractRating(undefined)).toBeNull()
  })
})

describe("extractTitle", () => {
  it("extrae el título del bloque <strong>", () => {
    const desc = "<p><strong>Inception</strong><br>2010</p>"
    expect(extractTitle(desc)).toBe("Inception")
  })

  it("devuelve null si no coincide el patrón", () => {
    expect(extractTitle("<p>otra cosa</p>")).toBeNull()
  })
})
