import { TMDB_API_KEY, TMDB_GENRES } from "../constants/genres.js"

const AUTH_ERROR =
  "TMDB rechazó la API key (401). Revisa VITE_TMDB_API_KEY y vuelve a desplegar."
const CACHE_LIMIT = 300

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

function cacheSet(title, value) {
  if (metadataCache.size >= CACHE_LIMIT) {
    const oldest = metadataCache.keys().next().value
    metadataCache.delete(oldest)
  }
  metadataCache.set(title, value)
}

/** Devuelve todos los géneros conocidos de una película (o ["Otro"]). */
function pickGenres(movieInfo, detailsData) {
  const ids = detailsData.genres?.length
    ? detailsData.genres.map((g) => g.id)
    : movieInfo.genre_ids || []

  const known = [...new Set(ids.map((id) => TMDB_GENRES[id]).filter(Boolean))]
  return known.length > 0 ? known : ["Otro"]
}

async function fetchOne(title, signal) {
  if (metadataCache.has(title)) return metadataCache.get(title)

  const cleanTitle = title.split(" - ")[0]
  const searchRes = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}&language=es-MX`,
    { signal },
  )

  if (searchRes.status === 401) throw tmdbAuthError()
  if (!searchRes.ok) return null

  const searchData = await searchRes.json()

  if (!(searchData.results?.length > 0)) {
    cacheSet(title, null)
    return null
  }

  const movieInfo = searchData.results[0]
  const detailsRes = await fetch(
    `https://api.themoviedb.org/3/movie/${movieInfo.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers&language=es-MX`,
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

  const director = detailsData.credits?.crew?.find(
    (p) => p.job === "Director",
  )?.name
  const actors =
    detailsData.credits?.cast?.slice(0, 9).map((a) => a.name) || []
  const country = detailsData.production_countries?.[0]?.iso_3166_1 || "UNKNOWN"
  const globalRating = detailsData.vote_average
    ? (detailsData.vote_average / 2).toFixed(1)
    : null
  const genres = pickGenres(movieInfo, detailsData)

  const item = {
    title,
    genres,
    genre: genres[0],
    director,
    actors,
    country,
    platforms,
    globalRating,
    popularity: detailsData.popularity || 0,
    releaseDate: detailsData.release_date || null,
  }

  cacheSet(title, item)
  return item
}

export async function fetchMetadataFromTMDB(movieTitles, { signal } = {}) {
  if (!TMDB_API_KEY) {
    throw new Error(
      "Falta la API key de TMDB (VITE_TMDB_API_KEY). Añádela a .env o a las variables del hosting y reconstruye.",
    )
  }

  const genreCounts = {
    Terror: 0,
    Acción: 0,
    "Ciencia Ficción": 0,
    Drama: 0,
    Comedia: 0,
    Thriller: 0,
    Romance: 0,
    Animación: 0,
    Documental: 0,
    Otro: 0,
  }

  // Deduplica títulos repetidos dentro de una misma tanda.
  const inFlight = new Map()
  const fetchPromises = movieTitles.map((title) => {
    if (!inFlight.has(title)) {
      inFlight.set(
        title,
        fetchOne(title, signal).catch((e) => {
          // Un fallo puntual de red no debe tumbar el resto; auth y abort sí.
          if (e.code === "TMDB_AUTH" || e.name === "AbortError") throw e
          return null
        }),
      )
    }
    return inFlight.get(title)
  })

  const results = await Promise.all(fetchPromises)

  const directorCounts = {}
  const actorCounts = {}
  const countryCounts = {}
  const platformCounts = {}

  results.forEach((item) => {
    if (!item) return

    item.genres.forEach((genre) => {
      genreCounts[genre] += 1
    })

    if (item.director)
      directorCounts[item.director] = (directorCounts[item.director] || 0) + 1
    item.actors.forEach((a) => {
      actorCounts[a] = (actorCounts[a] || 0) + 1
    })
    if (item.country !== "UNKNOWN")
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1
    item.platforms.forEach((p) => {
      platformCounts[p] = (platformCounts[p] || 0) + 1
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
