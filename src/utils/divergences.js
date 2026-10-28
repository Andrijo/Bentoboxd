const MIN_DIFF = 0.5
const LIMIT = 3

/**
 * Películas donde tu calificación más se aleja del promedio de TMDB (0–5).
 * `above`: les diste más que TMDB; `below`: les diste menos. Solo cuentan
 * diferencias de al menos media estrella. `diff` = tu nota − la de TMDB.
 */
export function computeDivergences(movies, { limit = LIMIT, minDiff = MIN_DIFF } = {}) {
  const compared = movies
    .filter((m) => m.rating > 0 && m.metrics?.rating > 0)
    .map((movie) => ({ movie, diff: movie.rating - movie.metrics.rating }))

  return {
    compared: compared.length,
    above: compared
      .filter((d) => d.diff >= minDiff)
      .sort((a, b) => b.diff - a.diff)
      .slice(0, limit),
    below: compared
      .filter((d) => d.diff <= -minDiff)
      .sort((a, b) => a.diff - b.diff)
      .slice(0, limit),
  }
}
