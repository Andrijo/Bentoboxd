/** Escalones de calificación de Letterboxd, de 0.5 a 5. */
export const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

// Diferencias menores a esto se consideran "igual que TMDB".
const SAME_AS_TMDB = 0.1

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7

/** "2026-03-12" → medianoche local, para que el día de la semana no se corra. */
const parseLocalDate = (isoDate) => {
  const [y, m, d] = isoDate.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const mean = (values) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null

/**
 * Resumen del feed: calificaciones, comparación con TMDB, me gusta,
 * revisiones, década más vista, rango de fechas, horas vistas, ritmo semanal y día más activo.
 * `metrics.rating` (promedio de TMDB, 0–5) y `metrics.runtime` (minutos) solo
 * existen tras cargar metadatos.
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

  const runtimes = movies
    .map((m) => m.metrics?.runtime)
    .filter((minutes) => minutes > 0)
  const runtimeMinutes = runtimes.reduce((a, b) => a + b, 0)

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

  // Ritmo: películas por semana sobre el periodo cubierto (mínimo una semana,
  // para que unos pocos días seguidos no inflen el promedio).
  const watchDays = dates.map(parseLocalDate)
  const spanDays = watchDays.length
    ? Math.round((watchDays[watchDays.length - 1] - watchDays[0]) / DAY_MS) + 1
    : 0
  const perWeek = watchDays.length
    ? watchDays.length / (Math.max(spanDays, WEEK_DAYS) / WEEK_DAYS)
    : null

  // Día más activo (0 = domingo). Empate: el primero de la semana, lunes primero.
  const weekdayCounts = Array(WEEK_DAYS).fill(0)
  for (const day of watchDays) weekdayCounts[day.getDay()] += 1
  const topWeekdayCount = Math.max(0, ...weekdayCounts)
  const topWeekday = topWeekdayCount
    ? [1, 2, 3, 4, 5, 6, 0].find((day) => weekdayCounts[day] === topWeekdayCount)
    : null

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
    runtimeMinutes,
    runtimeCount: runtimes.length,
    likedCount: movies.filter((m) => m.liked).length,
    rewatchCount: movies.filter((m) => m.rewatch).length,
    topDecade,
    topDecadeCount,
    datedCount: dates.length,
    spanDays,
    perWeek,
    topWeekday,
    topWeekdayCount,
    firstWatched: dates[0] || null,
    lastWatched: dates[dates.length - 1] || null,
  }
}
