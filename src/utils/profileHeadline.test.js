import { describe, it, expect } from "vitest"
import { profileHeadline } from "./profileHeadline.js"

const stats = (overrides) => ({ perWeek: 1.9, tmdbVerdict: "same", ...overrides })

describe("profileHeadline", () => {
  it("une ritmo, género y comparación con el público", () => {
    expect(profileHeadline(stats(), { drama: 20, comedy: 8, other: 1 })).toBe(
      "Casi 2 películas por semana, sobre todo de drama, y notas parecidas a las del público",
    )
  })

  it.each([
    [0.8, "Casi 1 película por semana"],
    [1, "1 película por semana"],
    [1.96, "2 películas por semana"],
    [2.4, "Más de 2 películas por semana"],
    [2.8, "Casi 3 películas por semana"],
    [0.7, "Cerca de 3 películas al mes"],
    [0.1, "Cerca de 1 película al mes"],
  ])("describe un ritmo de %s por semana", (perWeek, expected) => {
    expect(profileHeadline(stats({ perWeek, tmdbVerdict: null }), {})).toBe(expected)
  })

  it.each([
    ["kinder", "notas más altas que las del público"],
    ["harsher", "notas más bajas que las del público"],
  ])("explica el veredicto %s", (tmdbVerdict, expected) => {
    expect(profileHeadline(stats({ tmdbVerdict }), {})).toBe(
      `Casi 2 películas por semana y ${expected}`,
    )
  })

  it("mientras no hay datos de TMDB se queda con lo que ya sabe", () => {
    expect(profileHeadline(stats({ tmdbVerdict: null }), {})).toBe("Casi 2 películas por semana")
    expect(profileHeadline(stats({ tmdbVerdict: null }), { horror: 3 })).toBe(
      "Casi 2 películas por semana, sobre todo de terror",
    )
  })

  it("nombra dos géneros empatados y ninguno si son más", () => {
    expect(profileHeadline(stats({ tmdbVerdict: null }), { drama: 4, comedy: 4, horror: 1 })).toBe(
      "Casi 2 películas por semana, sobre todo de drama y de comedia",
    )
    expect(profileHeadline(stats({ tmdbVerdict: null }), { drama: 4, comedy: 4, horror: 4 })).toBe(
      "Casi 2 películas por semana",
    )
  })

  it("redacta los géneros que no admiten «de»", () => {
    expect(profileHeadline(stats({ tmdbVerdict: null }), { documentary: 5 })).toBe(
      "Casi 2 películas por semana, sobre todo documentales",
    )
    expect(profileHeadline(stats({ tmdbVerdict: null }), { family: 5 })).toBe(
      "Casi 2 películas por semana, sobre todo familiares",
    )
  })

  it("no destaca «Otro» ni un género con una sola película", () => {
    expect(profileHeadline(stats({ tmdbVerdict: null }), { other: 30, drama: 1 })).toBe(
      "Casi 2 películas por semana",
    )
  })

  it("sin fechas no hay titular", () => {
    expect(profileHeadline(stats({ perWeek: null }), { drama: 20 })).toBeNull()
  })
})
