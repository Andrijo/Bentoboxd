// Generación de layouts tipo "bento" que cubren el rectángulo de la cuadrícula
// por completo (sin celdas vacías).
//
// Tamaños de tarjeta (ver MovieCard.SIZES):
//   1 -> 1x1   (1 columna, 1 fila)
//   2 -> 2x1   (2 columnas, 1 fila)
//   3 -> 2x2   (2 columnas, 2 filas)
//
// El algoritmo busca, por backtracking, un conjunto de `count` fichas cuyo
// número de filas elegimos para lograr una densidad agradable, de modo que el
// área total coincida con `columns * rows` y las fichas encajen sin huecos.

const MAX_SEARCH_NODES = 50000

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function tileSize(size) {
  const width = size === 1 ? 1 : 2
  const height = size === 3 ? 2 : 1
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

    for (const size of shuffle([1, 2, 3])) {
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

// Ordena las cantidades de filas posibles según lo cerca que estén de una
// densidad objetivo (≈1.6 celdas por ficha), para que el layout no quede plano.
function rankedRows(count, columns) {
  const minRows = Math.max(1, Math.ceil(count / columns))
  const maxRows = Math.max(1, Math.floor((4 * count) / columns))
  const target = Math.round((1.6 * count) / columns)

  const rows = []
  for (let r = minRows; r <= maxRows; r++) rows.push(r)
  rows.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
  return rows
}

// Devuelve `{ columns, rows, sizes }`. Si el número de películas es demasiado
// pequeño para llenar el ancho pedido, se reducen las columnas hasta que el
// rectángulo se pueda cubrir por completo.
export function generateBentoLayout(columns, count) {
  if (count <= 0) return { columns, rows: 0, sizes: [] }

  for (const rows of rankedRows(count, columns)) {
    const sizes = solve(columns, rows, count, { nodes: MAX_SEARCH_NODES })
    if (sizes) return { columns, rows, sizes }
  }

  for (let narrower = columns - 1; narrower >= 1; narrower--) {
    const layout = generateBentoLayout(narrower, count)
    if (layout.sizes.length === count) return layout
  }

  return { columns, rows: 0, sizes: [] }
}
