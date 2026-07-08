export function generateGapFreePattern(columns, count) {
  const occupied = new Array(columns).fill(false)
  const nextOccupied = new Array(columns).fill(false)
  const pattern = []
  let col = 0

  for (let i = 0; i < count; i++) {
    while (col < columns && occupied[col]) {
      col++
    }
    if (col >= columns) {
      for (let j = 0; j < columns; j++) {
        occupied[j] = nextOccupied[j]
        nextOccupied[j] = false
      }
      col = 0
      while (col < columns && occupied[col]) {
        col++
      }
    }

    const remaining = columns - col
    let size = 1

    if (remaining >= 2) {
      const canPlaceBig = !nextOccupied[col] && !nextOccupied[col + 1]
      const r = Math.random()
      if (canPlaceBig && r < 0.25 && i + 1 < count) {
        size = 3
      } else if (r < 0.45) {
        size = 2
      }
    }

    pattern.push(size)
    occupied[col] = true

    if (size >= 2) {
      occupied[col + 1] = true
      if (size === 3) {
        nextOccupied[col] = true
        nextOccupied[col + 1] = true
      }
      col += 2
    } else {
      col += 1
    }
  }

  return pattern
}
