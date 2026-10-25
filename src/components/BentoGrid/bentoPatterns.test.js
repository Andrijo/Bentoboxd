import { describe, it, expect } from "vitest"
import { generateBentoLayout } from "./bentoPatterns.js"

// Replica la colocación "sparse" de grid-auto-flow:row a partir de la secuencia
// de tamaños y comprueba que se cubra el rectángulo sin huecos ni solapes.
function tilesCompletely({ columns, rows, sizes }) {
  if (rows === 0) return sizes.length === 0

  const occ = Array.from({ length: rows }, () => new Array(columns).fill(0))
  let curRow = 0
  let curCol = 0

  for (const size of sizes) {
    const w = size === 1 ? 1 : 2
    const h = size === 3 ? 2 : 1
    let placed = false

    for (let r = curRow; r < rows && !placed; r++) {
      const startCol = r === curRow ? curCol : 0
      for (let c = startCol; c < columns; c++) {
        if (c + w > columns || r + h > rows) continue

        let fits = true
        for (let y = r; y < r + h && fits; y++) {
          for (let x = c; x < c + w; x++) {
            if (occ[y][x]) {
              fits = false
              break
            }
          }
        }
        if (!fits) continue

        for (let y = r; y < r + h; y++) {
          for (let x = c; x < c + w; x++) occ[y][x]++
        }
        curRow = r
        curCol = c + w
        placed = true
        break
      }
    }

    if (!placed) return false
  }

  return occ.every((row) => row.every((cells) => cells === 1))
}

describe("generateBentoLayout", () => {
  it("devuelve un layout vacío sin películas", () => {
    expect(generateBentoLayout(5, 0)).toEqual({ columns: 5, rows: 0, sizes: [] })
  })

  it("cubre la cuadrícula por completo (sin huecos ni solapes) para muchos tamaños", () => {
    for (let columns = 2; columns <= 9; columns++) {
      for (let count = 1; count <= 18; count++) {
        for (let attempt = 0; attempt < 4; attempt++) {
          const layout = generateBentoLayout(columns, count)

          expect(layout.sizes).toHaveLength(count)
          expect(layout.columns).toBeGreaterThanOrEqual(1)
          expect(layout.columns).toBeLessThanOrEqual(columns)
          expect(layout.rows).toBeGreaterThanOrEqual(1)
          layout.sizes.forEach((size) => expect([1, 2, 3]).toContain(size))
          expect(tilesCompletely(layout)).toBe(true)
        }
      }
    }
  })

  it("produce una mezcla de tamaños en una cuadrícula típica", () => {
    const layout = generateBentoLayout(6, 15)
    expect(layout.sizes).toHaveLength(15)
    expect(layout.sizes.some((size) => size > 1)).toBe(true)
    expect(tilesCompletely(layout)).toBe(true)
  })

  it("reduce las columnas cuando hay muy pocas películas para llenar el ancho", () => {
    const layout = generateBentoLayout(8, 2)
    expect(layout.sizes).toHaveLength(2)
    expect(layout.columns).toBeLessThan(8)
    expect(tilesCompletely(layout)).toBe(true)
  })
})
