const MIN_MOVIES = 2
const LIMIT = 5

/** Ranking [nombre, películas]: con una sola película, un puesto no dice nada. */
export function topDirectors(directors) {
  return Object.entries(directors || {})
    .filter(([, count]) => count >= MIN_MOVIES)
    .sort((a, b) => b[1] - a[1])
    .slice(0, LIMIT)
}
