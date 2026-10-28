import { GENRE_KEYS, TMDB_GENRES } from "../constants/genres.js"

const AUTH_ERROR =
  "TMDB rechazó la API key (401). Revisa que TMDB_API_KEY esté definida en el servidor (o en .env en local)."
const CACHE_LIMIT = 300
// La key la añade el proxy (api/tmdb.js en producción, vite.config.js en dev).
const TMDB_PROXY_URL = (
  import.meta.env.VITE_TMDB_PROXY_URL || "/api/tmdb"
).replace(/\/$/, "")
const SEARCH_URL = `${TMDB_PROXY_URL}/search/movie`
const DETAILS_URL = `${TMDB_PROXY_URL}/movie`
const REQUEST_TIMEOUT_MS = 6000
const MAX_RETRIES = 2
const BASE_BACKOFF_MS = 400
const MAX_RETRY_DELAY_MS = 5000

/** Máximo de películas procesadas en paralelo (cada una hace 2-3 requests). */
export const TMDB_CONCURRENCY = 5

const metadataCache = new Map()
const platformLogoCache = new Map()

function tmdbAuthError() {
  const error = new Error(AUTH_ERROR)
  error.code = "TMDB_AUTH"
  return error
}

function createAbortError() {
  const error = new Error("Aborted")
  error.name = "AbortError"
  return error
}

function createTimeoutError() {
  const error = new Error("TMDB tardó demasiado en responder")
  error.name = "TimeoutError"
  return error
}

function sleep(ms, signal) {
  if (signal?.aborted) {
    return Promise.reject(signal.reason || createAbortError())
  }

  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)

    function onAbort() {
      clearTimeout(id)
      reject(signal.reason || createAbortError())
    }

    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

/**
 * Hace una petición con timeout propio, combinado con la señal externa.
 * El timeout se limpia siempre para no dejar timers colgando.
 */
async function fetchWithTimeout(url, signal) {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(createTimeoutError()),
    REQUEST_TIMEOUT_MS,
  )

  const onAbort = () => controller.abort(signal.reason || createAbortError())
  if (signal) {
    if (signal.aborted) onAbort()
    else signal.addEventListener("abort", onAbort, { once: true })
  }

  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener("abort", onAbort)
  }
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500
}

/**
 * Reintenta con backoff exponencial los errores transitorios (429, 5xx,
 * red o timeout). Un 401 se propaga de inmediato.
 */
async function fetchWithRetry(url, signal) {
  let attempt = 0

  while (true) {
    let res

    try {
      res = await fetchWithTimeout(url, signal)
    } catch (error) {
      // Si el usuario canceló, no reintentes.
      if (signal?.aborted) throw signal.reason || error

      // Un timeout ya consumió el presupuesto de espera: no lo repitas.
      if (error.name === "TimeoutError") throw error

      if (attempt < MAX_RETRIES) {
        await sleep(BASE_BACKOFF_MS * 2 ** attempt, signal)
        attempt += 1
        continue
      }

      throw error
    }

    if (res.status === 401) throw tmdbAuthError()
    if (res.ok) return res

    if (!isRetryableStatus(res.status) || attempt >= MAX_RETRIES) {
      return res
    }

    const retryAfterHeader = res.headers?.get?.("Retry-After")
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : NaN
    const delay = Number.isFinite(retryAfter)
      ? Math.min(retryAfter * 1000, MAX_RETRY_DELAY_MS)
      : BASE_BACKOFF_MS * 2 ** attempt

    await sleep(delay, signal)
    attempt += 1
  }
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
    query: title,
    language: "es-MX",
  })
  if (year) params.set("year", String(year))

  const res = await fetchWithRetry(`${SEARCH_URL}?${params}`, signal)
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
  const detailsRes = await fetchWithRetry(
    `${DETAILS_URL}/${movieInfo.id}?append_to_response=credits,watch/providers&language=es-MX`,
    signal,
  )

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
    runtime: detailsData.runtime || 0,
    releaseDate: detailsData.release_date || null,
  }

  cacheSet(key, item)
  return item
}

/** Ejecuta `mapper` sobre `items` con un máximo de `limit` en paralelo. */
async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= items.length) return
      results[index] = await mapper(items[index])
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  )

  await Promise.all(workers)
  return results
}

export async function fetchMetadataFromTMDB(movies, { signal } = {}) {
  // Se deriva de GENRE_KEYS para no duplicar la lista de géneros.
  const genreCounts = Object.fromEntries(GENRE_KEYS.map((genre) => [genre, 0]))

  const normalized = (movies || [])
    .map(normalizeMovie)
    .filter((movie) => movie.title)

  // Deduplica por título + año antes de repartir el trabajo.
  const uniqueMovies = new Map()
  normalized.forEach((movie) => {
    const key = movieCacheKey(movie)
    if (!uniqueMovies.has(key)) uniqueMovies.set(key, movie)
  })

  // Un fallo puntual de red no tumba el resto; auth y abort sí.
  let fatalError = null
  const results = await mapWithConcurrency(
    [...uniqueMovies.values()],
    TMDB_CONCURRENCY,
    async (movie) => {
      if (fatalError) return null

      try {
        return await fetchOne(movie, signal)
      } catch (e) {
        if (e.code === "TMDB_AUTH" || e.name === "AbortError") {
          fatalError = e
          throw e
        }
        return null
      }
    },
  )

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
