// Generación de layouts tipo "bento" que cubren el rectángulo de la cuadrícula
// por completo (sin celdas vacías).
//
// Tamaños de tarjeta (ver TILE_SPANS):
//   1 -> 1x1   (1 columna, 1 fila)
//   2 -> 2x1   (2 columnas, 1 fila)
//   3 -> 2x2   (2 columnas, 2 filas)
//   4 -> 1x2   (1 columna, 2 filas: la proporción del póster)
//
// El algoritmo busca, por backtracking, un conjunto de `count` fichas cuyo
// número de filas elegimos para lograr una densidad agradable, de modo que el
// área total coincida con `columns * rows` y las fichas encajen sin huecos.

import { shuffle } from "../../utils/shuffle.js"

const MAX_SEARCH_NODES = 50000

// Las vistas muestran solo las más recientes; las estadísticas y los juegos
// usan el feed completo.
export const VISIBLE_MOVIES = 20

/** Spans de CSS grid de cada tamaño (MovieCard y el skeleton). */
export const TILE_SPANS = {
  1: { gridColumn: "span 1", gridRow: "span 1" },
  2: { gridColumn: "span 2", gridRow: "span 1" },
  3: { gridColumn: "span 2", gridRow: "span 2" },
  4: { gridColumn: "span 1", gridRow: "span 2" },
}

function tileSize(size) {
  const width = size === 2 || size === 3 ? 2 : 1
  const height = size === 3 || size === 4 ? 2 : 1
  return { width, height, area: width * height }
}

// Intenta cubrir una cuadrícula de `rows` x `columns` con exactamente `count`
// fichas. Devuelve el arreglo de tamaños en orden de lectura (fila por fila),
// o null si no hay solución dentro del presupuesto de búsqueda.
function solve(columns, rows, count, budget) {
  const grid = Array.from({ length: rows }, () => new Array(columns).fill(false))
  const sizes = []

  const firstEmpty = () => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (!grid[r][c]) return [r, c]
      }
    }
    return null
  }

  const step = (remaining, cellsLeft) => {
    if (budget.nodes-- <= 0) return false
    if (remaining === 0) return cellsLeft === 0
    // Cada ficha cubre entre 1 y 4 celdas: poda imprescindible.
    if (cellsLeft < remaining || cellsLeft > 4 * remaining) return false

    const cell = firstEmpty()
    if (!cell) return remaining === 0
    const [row, col] = cell

    for (const size of shuffle([1, 2, 3, 4])) {
      const { width, height, area } = tileSize(size)
      if (col + width > columns || row + height > rows) continue

      let fits = true
      for (let y = row; y < row + height && fits; y++) {
        for (let x = col; x < col + width; x++) {
          if (grid[y][x]) {
            fits = false
            break
          }
        }
      }
      if (!fits) continue

      for (let y = row; y < row + height; y++) {
        for (let x = col; x < col + width; x++) grid[y][x] = true
      }
      sizes.push(size)

      if (step(remaining - 1, cellsLeft - area)) return true

      sizes.pop()
      for (let y = row; y < row + height; y++) {
        for (let x = col; x < col + width; x++) grid[y][x] = false
      }
    }

    return false
  }

  return step(count, columns * rows) ? sizes.slice() : null
}

// Celdas por ficha buscadas. Con menos (p. ej. 1.6) el área solo alcanza para
// unas pocas fichas grandes y el resto tiene que ser 1x1.
const TARGET_DENSITY = 2.2

// Ordena las cantidades de filas posibles según lo cerca que estén de
// TARGET_DENSITY, para que el layout no quede plano.
function rankedRows(count, columns) {
  const minRows = Math.max(1, Math.ceil(count / columns))
  const maxRows = Math.max(1, Math.floor((4 * count) / columns))
  const target = Math.round((TARGET_DENSITY * count) / columns)

  const rows = []
  for (let r = minRows; r <= maxRows; r++) rows.push(r)
  rows.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
  return rows
}

// Recorre las fichas en orden de lectura y devuelve la fila de cada una
// (igual que el auto-placement de CSS grid con estas fichas).
function tileRows(columns, rows, sizes) {
  const grid = Array.from({ length: rows }, () => new Array(columns).fill(false))
  let cursor = 0

  return sizes.map((size) => {
    while (grid[Math.floor(cursor / columns)][cursor % columns]) cursor++
    const row = Math.floor(cursor / columns)
    const col = cursor % columns
    const { width, height } = tileSize(size)
    for (let y = row; y < row + height; y++) {
      for (let x = col; x < col + width; x++) grid[y][x] = true
    }
    return row
  })
}

// Puntúa qué tan "bento" se ve un layout: fichas grandes repartidas por toda
// la altura (no amontonadas arriba), pocas 1x1 y pocas fichas anchas 2x1.
function scoreLayout(columns, rows, sizes) {
  const positions = tileRows(columns, rows, sizes)
  // Filas que toca alguna ficha de 2 de alto (2x2 o 1x2): rompen la retícula.
  const rowsWithTall = new Set()
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }

  sizes.forEach((size, i) => {
    counts[size]++
    if (size === 3 || size === 4) {
      rowsWithTall.add(positions[i])
      rowsWithTall.add(positions[i] + 1)
    }
  })

  // Mezcla buscada (≈2.2 celdas por ficha, ver TARGET_DENSITY): una 2x2 por
  // cada ~5 películas, a lo sumo ~30% de 1x1 y ~35% de 1x2.
  const targetBig = Math.max(1, Math.round(sizes.length / 5))
  const maxSmall = Math.round(sizes.length * 0.3)
  const maxTall = Math.round(sizes.length * 0.35)
  const rowsWithoutTall = rows - rowsWithTall.size

  return (
    -3 * Math.abs(counts[3] - targetBig) -
    2 * rowsWithoutTall -
    2 * Math.max(0, counts[1] - maxSmall) -
    2 * Math.max(0, counts[4] - maxTall) -
    Math.max(0, counts[2] - counts[3] - counts[4])
  )
}

// Cuántos layouts candidatos se generan para elegir el mejor. Cada uno cuesta
// décimas de milisegundo.
const CANDIDATES = 80

// Devuelve `{ columns, rows, sizes }`. Si el número de películas es demasiado
// pequeño para llenar el ancho pedido, se reducen las columnas hasta que el
// rectángulo se pueda cubrir por completo.
export function generateBentoLayout(columns, count) {
  if (count <= 0) return { columns, rows: 0, sizes: [] }

  for (const rows of rankedRows(count, columns)) {
    let best = null
    let bestScore = -Infinity

    for (let i = 0; i < CANDIDATES; i++) {
      const sizes = solve(columns, rows, count, { nodes: MAX_SEARCH_NODES })
      // Si no hay solución con estas filas, otro intento tampoco la hallará.
      if (!sizes) break
      const score = scoreLayout(columns, rows, sizes)
      if (score > bestScore) {
        best = sizes
        bestScore = score
      }
    }

    if (best) return { columns, rows, sizes: best }
  }

  for (let narrower = columns - 1; narrower >= 1; narrower--) {
    const layout = generateBentoLayout(narrower, count)
    if (layout.sizes.length === count) return layout
  }

  return { columns, rows: 0, sizes: [] }
}
