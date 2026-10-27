import { shuffle } from "./shuffle.js"

/**
 * Mazo de Higher or Lower: películas con dato en `category`, barajadas y sin
 * dos cartas seguidas con el mismo valor (un empate no tiene respuesta).
 * Cada carta toma la primera restante distinta de la anterior; las que ya
 * no caben en ningún lugar quedan fuera.
 */
export function buildDeck(movies, category, random) {
  const pool = shuffle(
    movies.filter((m) => m.metrics?.[category] > 0),
    random,
  )
  const deck = pool.length ? [pool.shift()] : []

  while (pool.length) {
    const last = deck[deck.length - 1].metrics[category]
    const next = pool.findIndex((m) => m.metrics[category] !== last)
    if (next === -1) break
    deck.push(...pool.splice(next, 1))
  }

  return deck
}

/** ¿Acierta `guess` ("higher" o "lower")? El mazo no deja empates. */
export function isCorrectGuess(guess, valA, valB) {
  return guess === "higher" ? valB > valA : valB < valA
}
