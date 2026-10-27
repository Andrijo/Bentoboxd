/**
 * Devuelve una copia barajada de `items` (Fisher–Yates).
 * A diferencia de `sort(() => 0.5 - Math.random())`, todas las permutaciones
 * son igual de probables.
 */
export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Generador pseudoaleatorio con semilla (mulberry32): misma semilla, misma
 * secuencia. Sirve para barajar igual en cada render de una misma partida.
 */
export function seededRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Semilla nueva para `seededRandom`. */
export function randomSeed() {
  return Math.floor(Math.random() * 4294967296)
}
