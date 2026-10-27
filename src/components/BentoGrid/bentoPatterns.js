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
function solve(columns, rows, count, budget, tiles) {
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

    for (const size of shuffle(tiles)) {
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

// Mezcla de fichas por modo.
// - density: celdas por ficha buscadas. Con poca (p. ej. 1.6) el área solo
//   alcanza para unas pocas fichas grandes y el resto tiene que ser 1x1.
// - maxSmall / maxTall: fracción máxima de 1x1 y de 1x2.
// - rowWeight: castigo por cada fila sin ficha de 2 de alto.
// En móvil (`compact`, 3 columnas angostas) la 1x1 ya tiene forma de póster y
// la 1x2 quedaría como una tira, así que ninguna 1x2. Ahí cada 2x2 deja una
// columna que solo llenan dos 1x1, así que ~60% de 1x1 es inevitable; con 20
// películas, 1.8 lleva a 12 filas (4 bandas con 2x2 + 4 filas de 2x1 y 1x1).
// La única ficha alta es la 2x2: castigar filas sin ella llenaría todo de 2x2.
const MIXES = {
  default: { tiles: [1, 2, 3, 4], density: 2.2, maxSmall: 0.3, maxTall: 0.35, rowWeight: 2 },
  compact: { tiles: [1, 2, 3], density: 1.8, maxSmall: 0.6, maxTall: 0, rowWeight: 0 },
}

// Ordena las cantidades de filas posibles según lo cerca que estén de la
// densidad de la mezcla, para que el layout no quede plano.
function rankedRows(count, columns, density) {
  const minRows = Math.max(1, Math.ceil(count / columns))
  const maxRows = Math.max(1, Math.floor((4 * count) / columns))
  const target = Math.round((density * count) / columns)

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
function scoreLayout(columns, rows, sizes, mix) {
  const positions = tileRows(columns, rows, sizes)
  // Filas que toca alguna ficha de 2 de alto (2x2 o 1x2): rompen la retícula.
  const rowsWithTall = new Set()
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  let lowestBig = -1

  sizes.forEach((size, i) => {
    counts[size]++
    if (size === 3) lowestBig = Math.max(lowestBig, positions[i])
    if (size === 3 || size === 4) {
      rowsWithTall.add(positions[i])
      rowsWithTall.add(positions[i] + 1)
    }
  })

  // Una 2x2 por cada ~5 películas; los topes de 1x1 y 1x2 vienen de la mezcla.
  const targetBig = Math.max(1, Math.round(sizes.length / 5))
  const maxSmall = Math.round(sizes.length * mix.maxSmall)
  const maxTall = Math.round(sizes.length * mix.maxTall)
  const rowsWithoutTall = rows - rowsWithTall.size
  // Las 1x2 pueden cubrir las filas de abajo solas; las 2x2 también deben
  // llegar a la mitad inferior en vez de amontonarse arriba.
  const bigOnlyOnTop = lowestBig >= 0 && lowestBig + 1 < rows / 2

  return (
    -3 * Math.abs(counts[3] - targetBig) -
    mix.rowWeight * rowsWithoutTall -
    (bigOnlyOnTop ? 6 : 0) -
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
// rectángulo se pueda cubrir por completo. `compact` usa la mezcla de móvil.
export function generateBentoLayout(columns, count, { compact = false } = {}) {
  if (count <= 0) return { columns, rows: 0, sizes: [] }
  const mix = compact ? MIXES.compact : MIXES.default

  for (const rows of rankedRows(count, columns, mix.density)) {
    let best = null
    let bestScore = -Infinity

    for (let i = 0; i < CANDIDATES; i++) {
      const sizes = solve(columns, rows, count, { nodes: MAX_SEARCH_NODES }, mix.tiles)
      // Si no hay solución con estas filas, otro intento tampoco la hallará.
      if (!sizes) break
      const score = scoreLayout(columns, rows, sizes, mix)
      if (score > bestScore) {
        best = sizes
        bestScore = score
      }
    }

    if (best) return { columns, rows, sizes: best }
  }

  for (let narrower = columns - 1; narrower >= 1; narrower--) {
    const layout = generateBentoLayout(narrower, count, { compact })
    if (layout.sizes.length === count) return layout
  }

  return { columns, rows: 0, sizes: [] }
}
