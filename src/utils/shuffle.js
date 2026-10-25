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
