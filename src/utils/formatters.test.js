import { describe, it, expect } from "vitest"
import { countryName, formatMovieCount, formatWatchedDate } from "./formatters.js"

describe("formatMovieCount", () => {
  it("usa singular solo para 1", () => {
    expect(formatMovieCount(1)).toBe("1 película")
    expect(formatMovieCount(0)).toBe("0 películas")
    expect(formatMovieCount(3)).toBe("3 películas")
  })
})

describe("formatWatchedDate", () => {
  it("formatea la fecha sin correr el día por zona horaria", () => {
    const formatted = formatWatchedDate("2024-01-01")
    expect(formatted).toMatch(/^1 /)
    expect(formatted).toContain("2024")
  })

  it("devuelve null con fechas ausentes o inválidas", () => {
    expect(formatWatchedDate(null)).toBeNull()
    expect(formatWatchedDate("12/05/2024")).toBeNull()
  })
})

describe("countryName", () => {
  it("nombra en español cualquier código ISO", () => {
    expect(countryName("JP")).toBe("Japón")
    expect(countryName("US")).toBe("Estados Unidos")
    expect(countryName("TW")).toBe("Taiwán")
  })

  it("devuelve el código si no es un código de región válido", () => {
    expect(countryName("NOPE")).toBe("NOPE")
  })
})
