import { describe, it, expect } from "vitest"
import { topDirectors } from "./topDirectors.js"

describe("topDirectors", () => {
  it("ordena de mayor a menor y deja fuera a quienes tienen una película", () => {
    expect(topDirectors({ Ana: 2, Luis: 1, Eva: 4 })).toEqual([["Eva", 4], ["Ana", 2]])
  })

  it("se limita a 5", () => {
    const directors = Object.fromEntries(["A", "B", "C", "D", "E", "F"].map((name) => [name, 2]))

    expect(topDirectors(directors)).toHaveLength(5)
  })

  it("queda vacío si nadie repite o aún no hay datos", () => {
    expect(topDirectors({ Ana: 1 })).toEqual([])
    expect(topDirectors(undefined)).toEqual([])
  })
})
