import { describe, it, expect } from "vitest"
import { buildDeck, isCorrectGuess } from "./highLowDeck.js"
import { seededRandom } from "./shuffle.js"

const movie = (title, year) => ({ title, metrics: { year } })

describe("buildDeck", () => {
  it("deja fuera las películas sin dato en la categoría", () => {
    const deck = buildDeck(
      [movie("A", 2001), movie("B", 0), { title: "C" }, movie("D", 1999)],
      "year",
      seededRandom(1),
    )
    expect(deck.map((m) => m.title).toSorted()).toEqual(["A", "D"])
  })

  it("nunca pone dos valores iguales seguidos", () => {
    const movies = [2000, 2000, 2000, 2001, 2001, 2002, 2003, 2003].map(
      (year, i) => movie(String(i), year),
    )
    for (let seed = 0; seed < 200; seed += 1) {
      const deck = buildDeck(movies, "year", seededRandom(seed))
      for (let i = 1; i < deck.length; i += 1) {
        expect(deck[i].metrics.year).not.toBe(deck[i - 1].metrics.year)
      }
    }
  })

  it("conserva todas las cartas cuando se pueden intercalar", () => {
    const movies = [2000, 2000, 2001, 2001].map((year, i) => movie(String(i), year))
    for (let seed = 0; seed < 50; seed += 1) {
      expect(buildDeck(movies, "year", seededRandom(seed))).toHaveLength(4)
    }
  })

  it("devuelve un mazo vacío sin películas", () => {
    expect(buildDeck([], "year", seededRandom(1))).toEqual([])
  })
})

describe("isCorrectGuess", () => {
  it("compara de forma estricta", () => {
    expect(isCorrectGuess("higher", 3, 4)).toBe(true)
    expect(isCorrectGuess("higher", 4, 3)).toBe(false)
    expect(isCorrectGuess("lower", 4, 3)).toBe(true)
    expect(isCorrectGuess("lower", 3, 4)).toBe(false)
  })
})
