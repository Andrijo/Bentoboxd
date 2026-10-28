const MIN_RATED = 2
const LIMIT = 5

/**
 * Géneros o directores (`field`) mejor calificados por ti: promedio de tus
 * calificaciones entre las películas calificadas que los incluyen. Un solo
 * título no hace una tendencia, así que exige al menos `minRated` películas.
 * Empate: gana el que tiene más películas calificadas, luego el nombre.
 */
export function computeTopRated(
  movies,
  field,
  { minRated = MIN_RATED, limit = LIMIT, exclude = [] } = {},
) {
  const groups = new Map()

  for (const movie of movies) {
    if (!(movie.rating > 0)) continue
    for (const name of new Set(movie[field] || [])) {
      if (exclude.includes(name)) continue
      const group = groups.get(name) || { sum: 0, count: 0 }
      group.sum += movie.rating
      group.count += 1
      groups.set(name, group)
    }
  }

  return [...groups]
    .filter(([, { count }]) => count >= minRated)
    .map(([name, { sum, count }]) => ({ name, average: sum / count, count }))
    .sort(
      (a, b) =>
        b.average - a.average || b.count - a.count || a.name.localeCompare(b.name),
    )
    .slice(0, limit)
}
