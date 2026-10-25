import { GENRE_KEYS, TMDB_API_KEY, TMDB_GENRES } from "../constants/genres.js"

const AUTH_ERROR =
  "TMDB rechazó la API key (401). Revisa TMDB_API_KEY y vuelve a desplegar."
const CACHE_LIMIT = 300
const SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
const DETAILS_URL = "https://api.themoviedb.org/3/movie"

const metadataCache = new Map()
const platformLogoCache = new Map()

function tmdbAuthError() {
  const error = new Error(AUTH_ERROR)
  error.code = "TMDB_AUTH"
  return error
}

/** Vacía la caché en memoria (tests o cambio de contexto). */
export function clearMetadataCache() {
  metadataCache.clear()
  platformLogoCache.clear()
}

function cacheSet(key, value) {
  if (metadataCache.size >= CACHE_LIMIT) {
    const oldest = metadataCache.keys().next().value
    metadataCache.delete(oldest)
  }
  metadataCache.set(key, value)
}

function normalizeYear(year) {
  const value = Number(year)
  return Number.isFinite(value) && value > 0 ? value : null
}

/** Acepta strings (compatibilidad) u objetos { title, year }. */
function normalizeMovie(movie) {
  if (typeof movie === "string") {
    return { title: movie.trim(), year: null }
  }

  return {
    title: String(movie?.title || "").trim(),
    year: normalizeYear(movie?.year),
  }
}

function movieCacheKey({ title, year }) {
  return year ? `${title}::${year}` : title
}

/** Devuelve todos los géneros conocidos de una película (o ["Otro"]). */
function pickGenres(movieInfo, detailsData) {
  const ids = detailsData.genres?.length
    ? detailsData.genres.map((g) => g.id)
    : movieInfo.genre_ids || []

  const known = [...new Set(ids.map((id) => TMDB_GENRES[id]).filter(Boolean))]
  return known.length > 0 ? known : ["Otro"]
}

/**
 * Elige el resultado cuyo estreno se acerca más al año del RSS.
 * Si no hay año o ninguno está a ±1 año, mantiene el primer resultado.
 */
function pickBestResult(results, year) {
  if (!year) return results[0]

  let best = null
  let bestDiff = Infinity

  for (const result of results) {
    if (!result.release_date) continue
    const releaseYear = Number(result.release_date.slice(0, 4))
    if (!Number.isFinite(releaseYear)) continue

    const diff = Math.abs(releaseYear - year)
    if (diff < bestDiff) {
      best = result
      bestDiff = diff
    }
  }

  return best && bestDiff <= 1 ? best : results[0]
}

/**
 * Busca una película. Devuelve [] si no hay resultados y null si la petición
 * falla, para no cachear errores transitorios.
 */
async function searchMovies(title, year, signal) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: title,
    language: "es-MX",
  })
  if (year) params.set("year", String(year))

  const res = await fetch(`${SEARCH_URL}?${params}`, { signal })

  if (res.status === 401) throw tmdbAuthError()
  if (!res.ok) return null

  const data = await res.json()
  return data?.results || []
}

async function fetchOne({ title, year }, signal) {
  const key = movieCacheKey({ title, year })
  if (metadataCache.has(key)) return metadataCache.get(key)

  let results = await searchMovies(title, year, signal)
  if (results === null) return null

  // Si el año del RSS no coincide con el de TMDB, reintenta sin filtro.
  if (year && results.length === 0) {
    results = await searchMovies(title, null, signal)
    if (results === null) return null
  }

  if (results.length === 0) {
    cacheSet(key, null)
    return null
  }

  const movieInfo = pickBestResult(results, year)
  const detailsRes = await fetch(
    `${DETAILS_URL}/${movieInfo.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers&language=es-MX`,
    { signal },
  )

  if (detailsRes.status === 401) throw tmdbAuthError()
  if (!detailsRes.ok) return null

  const detailsData = await detailsRes.json()

  const platforms =
    detailsData["watch/providers"]?.results?.MX?.flatrate?.map((p) => {
      platformLogoCache.set(
        p.provider_name,
        `https://image.tmdb.org/t/p/w45${p.logo_path}`,
      )
      return p.provider_name
    }) || []

  const directors = [
    ...new Set(
      (detailsData.credits?.crew || [])
        .filter((person) => person.job === "Director")
        .map((person) => person.name)
        .filter(Boolean),
    ),
  ]

  const actors =
    detailsData.credits?.cast?.slice(0, 9).map((a) => a.name) || []

  const countries = [
    ...new Set(
      (detailsData.production_countries || [])
        .map((country) => country.iso_3166_1)
        .filter(Boolean),
    ),
  ]

  const globalRating = detailsData.vote_average
    ? (detailsData.vote_average / 2).toFixed(1)
    : null
  const genres = pickGenres(movieInfo, detailsData)

  const item = {
    title,
    queryYear: year,
    genres,
    genre: genres[0],
    directors,
    director: directors[0] || null,
    actors,
    countries,
    country: countries[0] || "UNKNOWN",
    platforms,
    globalRating,
    popularity: detailsData.popularity || 0,
    releaseDate: detailsData.release_date || null,
  }

  cacheSet(key, item)
  return item
}

export async function fetchMetadataFromTMDB(movies, { signal } = {}) {
  if (!TMDB_API_KEY) {
    throw new Error(
      "Falta la API key de TMDB (TMDB_API_KEY). Añádela a .env o a las variables del hosting y reconstruye.",
    )
  }

  // Se deriva de GENRE_KEYS para no duplicar la lista de géneros.
  const genreCounts = Object.fromEntries(GENRE_KEYS.map((genre) => [genre, 0]))

  const normalized = (movies || [])
    .map(normalizeMovie)
    .filter((movie) => movie.title)

  // Deduplica títulos (y años) repetidos dentro de una misma tanda.
  const inFlight = new Map()
  const fetchPromises = normalized.map((movie) => {
    const key = movieCacheKey(movie)
    if (!inFlight.has(key)) {
      inFlight.set(
        key,
        fetchOne(movie, signal).catch((e) => {
          // Un fallo puntual de red no debe tumbar el resto; auth y abort sí.
          if (e.code === "TMDB_AUTH" || e.name === "AbortError") throw e
          return null
        }),
      )
    }
    return inFlight.get(key)
  })

  const results = await Promise.all(fetchPromises)

  const directorCounts = {}
  const actorCounts = {}
  const countryCounts = {}
  const platformCounts = {}

  results.forEach((item) => {
    if (!item) return

    item.genres.forEach((genre) => {
      if (genre in genreCounts) genreCounts[genre] += 1
    })

    const directors = item.directors || (item.director ? [item.director] : [])
    directors.forEach((director) => {
      directorCounts[director] = (directorCounts[director] || 0) + 1
    })

    item.actors.forEach((actor) => {
      actorCounts[actor] = (actorCounts[actor] || 0) + 1
    })

    const countries = item.countries || (item.country ? [item.country] : [])
    countries.forEach((country) => {
      if (country !== "UNKNOWN") {
        countryCounts[country] = (countryCounts[country] || 0) + 1
      }
    })

    item.platforms.forEach((platform) => {
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
    })
  })

  return {
    genres: genreCounts,
    directors: directorCounts,
    actors: actorCounts,
    countries: countryCounts,
    platforms: {
      counts: platformCounts,
      logos: Object.fromEntries(platformLogoCache),
    },
    rawResults: results,
  }
}
