import { describe, it, expect } from "vitest"
import { generateQuestions } from "./quizQuestions.js"

const movies = [
  { title: "A", year: "2025", rating: 4.5 },
  { title: "B", year: "1999", rating: null },
  { title: "C", year: "1890", rating: 3 },
  { title: "D", year: "2010", rating: 5 },
  { title: "E", year: "2020", rating: 0.5 },
  { title: "F", year: null, rating: 2 },
]

function runMany(fn, times = 200) {
  for (let i = 0; i < times; i += 1) fn()
}

describe("generateQuestions", () => {
  it("genera 5 preguntas con 4 opciones distintas que incluyen la correcta", () => {
    runMany(() => {
      const questions = generateQuestions(movies, { currentYear: 2026 })

      expect(questions).toHaveLength(5)
      questions.forEach((q) => {
        expect(q.options).toHaveLength(4)
        expect(new Set(q.options).size).toBe(4)
        expect(q.options).toContain(q.correct)
      })
    })
  })

  it("no propone años posteriores al actual ni anteriores al cine", () => {
    runMany(() => {
      generateQuestions(movies, { currentYear: 2026 })
        .filter((q) => q.isYear)
        .forEach((q) => {
          q.options.forEach((year) => {
            expect(Number(year)).toBeLessThanOrEqual(2026)
            expect(Number(year)).toBeGreaterThanOrEqual(1888)
          })
        })
    })
  })

  it("permite años futuros solo si la película aún no se estrena", () => {
    runMany(() => {
      const [q] = generateQuestions([{ title: "X", year: "2030" }], {
        currentYear: 2026,
        random: () => 0.9,
      })

      expect(q.isYear).toBe(true)
      q.options.forEach((year) => {
        expect(Number(year)).toBeLessThanOrEqual(2030)
      })
    })
  })

  it("usa 'Sin calificar' como respuesta si la película no tiene rating", () => {
    const [q] = generateQuestions([{ title: "B", year: null, rating: null }])

    expect(q.isYear).toBe(false)
    expect(q.correct).toBe("Sin calificar")
  })
})
