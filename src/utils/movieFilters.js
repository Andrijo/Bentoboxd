const movieKey = (movie) => movie.tmdbId ?? `${movie.title}::${movie.year}`

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
