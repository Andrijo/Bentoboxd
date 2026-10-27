import { describe, it, expect } from "vitest"
import { generateBentoLayout } from "./bentoPatterns.js"

// Ancho y alto en celdas de cada tamaño (1x1, 2x1, 2x2, 1x2).
const dims = (size) => ({
  w: size === 2 || size === 3 ? 2 : 1,
  h: size === 3 || size === 4 ? 2 : 1,
})

// Replica la colocación "sparse" de grid-auto-flow:row a partir de la secuencia
// de tamaños y comprueba que se cubra el rectángulo sin huecos ni solapes.
function tilesCompletely({ columns, rows, sizes }) {
  if (rows === 0) return sizes.length === 0

  const occ = Array.from({ length: rows }, () => new Array(columns).fill(0))
  let curRow = 0
  let curCol = 0

  for (const size of sizes) {
    const { w, h } = dims(size)
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

// Fila superior de cada ficha 2x2, simulando el auto-placement de CSS grid.
function bigTileRows({ columns, rows, sizes }) {
  const grid = Array.from({ length: rows }, () => new Array(columns).fill(false))
  const result = []
  let cursor = 0

  sizes.forEach((size) => {
    while (grid[Math.floor(cursor / columns)][cursor % columns]) cursor++
    const row = Math.floor(cursor / columns)
    const col = cursor % columns
    const { w: width, h: height } = dims(size)
    for (let y = row; y < row + height; y++) {
      for (let x = col; x < col + width; x++) grid[y][x] = true
    }
    if (size === 3) result.push(row)
  })

  return result
}

describe("generateBentoLayout", () => {
  it("devuelve un layout vacío sin películas", () => {
    expect(generateBentoLayout(5, 0)).toEqual({ columns: 5, rows: 0, sizes: [] })
  })

  it("cubre la cuadrícula por completo (sin huecos ni solapes) para muchos tamaños", () => {
    for (let columns = 2; columns <= 9; columns++) {
      for (let count = 1; count <= 20; count++) {
        for (let attempt = 0; attempt < 4; attempt++) {
          const layout = generateBentoLayout(columns, count)

          expect(layout.sizes).toHaveLength(count)
          expect(layout.columns).toBeGreaterThanOrEqual(1)
          expect(layout.columns).toBeLessThanOrEqual(columns)
          expect(layout.rows).toBeGreaterThanOrEqual(1)
          layout.sizes.forEach((size) => expect([1, 2, 3, 4]).toContain(size))
          expect(tilesCompletely(layout)).toBe(true)
        }
      }
    }
  })

  it("produce una mezcla de tamaños en una cuadrícula típica", () => {
    const layout = generateBentoLayout(6, 20)
    expect(layout.sizes).toHaveLength(20)
    expect(layout.sizes.some((size) => size > 1)).toBe(true)
    expect(tilesCompletely(layout)).toBe(true)
  })

  it("reparte las fichas grandes por toda la altura con 20 películas", () => {
    for (let columns = 4; columns <= 8; columns++) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const layout = generateBentoLayout(columns, 20)
        const rows = bigTileRows(layout)

        expect(rows.length).toBeGreaterThanOrEqual(3)
        // Al menos una ficha grande en la mitad inferior, no todas arriba.
        expect(Math.max(...rows) + 1).toBeGreaterThanOrEqual(layout.rows / 2)
      }
    }
  })

  it("no llena la cuadrícula de 1x1 con 20 películas", () => {
    for (let columns = 2; columns <= 8; columns++) {
      for (let attempt = 0; attempt < 10; attempt++) {
        const { sizes } = generateBentoLayout(columns, 20)
        const small = sizes.filter((size) => size === 1).length
        expect(small).toBeLessThanOrEqual(7)
        // Las verticales tampoco deben dominar.
        expect(sizes.filter((size) => size === 4).length).toBeLessThanOrEqual(10)
      }
    }
  })

  it("en móvil (compact) cubre sin huecos, sin 1x2 y con pocas 2x2", () => {
    for (let count = 1; count <= 20; count++) {
      for (let attempt = 0; attempt < 4; attempt++) {
        const layout = generateBentoLayout(3, count, { compact: true })
        expect(layout.sizes).toHaveLength(count)
        expect(layout.sizes).not.toContain(4)
        expect(tilesCompletely(layout)).toBe(true)
      }
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const { sizes, rows } = generateBentoLayout(3, 20, { compact: true })
      expect(sizes.filter((size) => size === 3).length).toBeLessThanOrEqual(5)
      expect(rows).toBeLessThanOrEqual(12)
    }
  })

  it("reduce las columnas cuando hay muy pocas películas para llenar el ancho", () => {
    const layout = generateBentoLayout(8, 2)
    expect(layout.sizes).toHaveLength(2)
    expect(layout.columns).toBeLessThan(8)
    expect(tilesCompletely(layout)).toBe(true)
  })
})
