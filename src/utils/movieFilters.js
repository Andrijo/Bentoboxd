const UNRATED = "unrated"

export const NO_FILTERS = { liked: false, rating: "", year: "" }

const movieKey = (movie) => movie.tmdbId ?? `${movie.title}::${movie.year}`
const ratingKey = (movie) => (movie.rating ? String(movie.rating) : UNRATED)

export function filterMovies(movies, { liked, rating, year }) {
  return movies.filter(
    (movie) =>
      (!liked || movie.liked) &&
      (!rating || ratingKey(movie) === rating) &&
      (!year || movie.year === year),
  )
}

/** Solo lo que existe en el diario: ningún filtro puede quedar vacío por sí solo. */
export function filterOptions(movies) {
  const rated = [...new Set(movies.map((m) => m.rating).filter(Boolean))].sort((a, b) => b - a)
  const ratings = rated.map((rating) => ({ value: String(rating), label: `${rating}★` }))
  if (movies.some((m) => !m.rating)) ratings.push({ value: UNRATED, label: "Sin calificar" })

  const years = [...new Set(movies.map((m) => m.year).filter(Boolean))].sort((a, b) => b - a)

  return { ratings, years }
}

/**
 * Películas cuya lista `field` incluye `value`, en el orden del feed. Una vista
 * otra vez aparece una sola vez: así coincide con los conteos de TMDB.
 */
export function moviesWith(movies, field, value) {
  const seen = new Set()

  return movies.filter((movie) => {
    if (!movie[field]?.includes(value)) return false
    const key = movieKey(movie)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
