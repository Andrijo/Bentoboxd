import { describe, it, expect } from "vitest"
import { countryName, formatDuration, formatHours, formatMonth, formatMonthYear, formatMovieCount, formatPercent, formatWatchedDate, weekdayName } from "./formatters.js"

describe("formatPercent", () => {
  it("redondea sobre la base dada y no divide entre cero", () => {
    expect(formatPercent(27, 50)).toBe("54%")
    expect(formatPercent(1, 3)).toBe("33%")
    expect(formatPercent(1, 0)).toBe("0%")
  })
})

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

describe("formatDuration", () => {
  it("combina horas y minutos y omite lo que sobra", () => {
    expect(formatDuration(125)).toBe("2 h 5 min")
    expect(formatDuration(120)).toBe("2 h")
    expect(formatDuration(45)).toBe("45 min")
    expect(formatDuration(0)).toBe("0 min")
  })
})

describe("formatMonth", () => {
  it("nombra el mes sin correr la fecha por zona horaria", () => {
    expect(formatMonth("2026-03")).toBe("mar")
    expect(formatMonthYear("2026-01")).toBe("ene 2026")
  })
})

describe("formatHours", () => {
  it("redondea a horas y conserva los minutos si no llega a una", () => {
    expect(formatHours(5146)).toBe("86 h")
    expect(formatHours(60)).toBe("1 h")
    expect(formatHours(45)).toBe("45 min")
  })
})

describe("weekdayName", () => {
  it("nombra el día en español con inicial mayúscula", () => {
    expect(weekdayName(0)).toBe("Domingo")
    expect(weekdayName(1)).toBe("Lunes")
    expect(weekdayName(6)).toBe("Sábado")
  })
})
