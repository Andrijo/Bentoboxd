/** Escalones de calificación de Letterboxd, de 0.5 a 5. */
export const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

// Diferencias menores a esto se consideran "igual que TMDB".
const SAME_AS_TMDB = 0.1

const mean = (values) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null

/**
 * Resumen del feed: calificaciones, comparación con TMDB, me gusta,
 * revisiones, década favorita y rango de fechas vistas.
 * `metrics.rating` (promedio de TMDB, 0–5) solo existe tras cargar metadatos.
 */
export function computeProfileStats(movies) {
  const rated = movies.filter((m) => m.rating > 0)

  const distribution = RATING_STEPS.map((step) => ({
    rating: step,
    count: rated.filter((m) => m.rating === step).length,
  }))

  const diffs = rated
    .filter((m) => m.metrics?.rating > 0)
    .map((m) => m.rating - m.metrics.rating)
  const tmdbDiff = mean(diffs)

  const decades = {}
  for (const m of movies) {
    const year = parseInt(m.year, 10)
    if (year) {
      const decade = Math.floor(year / 10) * 10
      decades[decade] = (decades[decade] || 0) + 1
    }
  }
  // Empate: gana la década más reciente.
  const [topDecade, topDecadeCount] = Object.entries(decades)
    .map(([decade, count]) => [Number(decade), count])
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])[0] || [null, 0]

  // Fechas ISO (AAAA-MM-DD): el orden de texto es el cronológico.
  const dates = movies.map((m) => m.watchedDate).filter(Boolean).sort()

  return {
    total: movies.length,
    ratedCount: rated.length,
    unratedCount: movies.length - rated.length,
    average: mean(rated.map((m) => m.rating)),
    distribution,
    tmdbDiff,
    tmdbCompared: diffs.length,
    tmdbVerdict:
      tmdbDiff === null
        ? null
        : Math.abs(tmdbDiff) < SAME_AS_TMDB
          ? "same"
          : tmdbDiff > 0
            ? "kinder"
            : "harsher",
    likedCount: movies.filter((m) => m.liked).length,
    rewatchCount: movies.filter((m) => m.rewatch).length,
    topDecade,
    topDecadeCount,
    firstWatched: dates[0] || null,
    lastWatched: dates[dates.length - 1] || null,
  }
}
