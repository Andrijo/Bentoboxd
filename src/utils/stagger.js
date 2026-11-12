/** Retraso máximo de una entrada escalonada (umbral de Doherty: < 400ms). */
export const MAX_STAGGER_MS = 300

/** Retraso CSS del elemento `index` en una lista que entra escalonada. */
export function staggerDelay(index, stepMs) {
  return `${Math.min(index * stepMs, MAX_STAGGER_MS)}ms`
}
