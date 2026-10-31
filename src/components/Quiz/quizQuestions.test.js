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

  describe("preguntas de director y póster", () => {
    const rich = ["A", "B", "C", "D", "E", "F"].map((title, i) => ({
      title,
      year: String(2000 + i),
      rating: 3,
      poster: `https://img/${title}.jpg`,
      directors: [`Director ${title}`],
    }))

    it("pregunta por director y póster con distractores del propio diario", () => {
      const seen = new Set()
      runMany(() => {
        generateQuestions(rich, { currentYear: 2026 }).forEach((q) => {
          seen.add(q.type)
          if (q.type === "director") {
            expect(q.correct).toBe(q.movie.directors[0])
            expect(q.options.every((o) => o.startsWith("Director "))).toBe(true)
          }
          if (q.type === "poster") {
            expect(q.correct).toBe(q.movie.title)
          }
          expect(new Set(q.options).size).toBe(4)
          expect(q.options).toContain(q.correct)
        })
      })
      expect(seen).toEqual(new Set(["rating", "year", "director", "poster"]))
    })

    it("no usa a un codirector de la película como opción falsa", () => {
      const coDirected = {
        ...rich[0],
        title: "Fargo",
        directors: ["Joel Coen", "Ethan Coen"],
      }
      runMany(() => {
        generateQuestions([coDirected, ...rich.slice(1)], { currentYear: 2026 })
          .filter((q) => q.type === "director" && q.movie.title === "Fargo")
          .forEach((q) => {
            expect(q.correct).toBe("Joel Coen")
            expect(q.options).not.toContain("Ethan Coen")
          })
      })
    })

    it("no pregunta por un director si los codirectores agotan los distractores", () => {
      const coDirected = rich.slice(0, 4).map((movie) => ({
        ...movie,
        directors: ["Ana", "Luis", "Eva"],
      }))
      coDirected.push({ ...rich[4], directors: ["Otro"] })

      runMany(() => {
        generateQuestions(coDirected, { currentYear: 2026 })
          .filter((q) => q.movie.directors.length > 1)
          .forEach((q) => {
            expect(q.type).not.toBe("director")
          })
      })
    })

    it("no pregunta por director ni póster sin datos o sin distractores suficientes", () => {
      const few = rich.slice(0, 3)
      runMany(() => {
        generateQuestions(few, { currentYear: 2026 }).forEach((q) => {
          expect(["rating", "year"]).toContain(q.type)
        })
      })
    })
  })
})
