import { useState, useCallback, useRef } from "react"
import {
  isValidUsername,
  parseUsername,
  buildRssUrl,
  extractPoster,
  extractRating,
  safeFilmLink,
} from "../services/letterboxd.js"
import { useMessages } from "../i18n/index.js"

/** Máximo de películas leídas del feed (el RSS de Letterboxd trae ~50). */
export const FEED_LIMIT = 50

const FEED_TIMEOUT_MS = 15000

const LETTERBOXD_NS = "https://letterboxd.com"
const TMDB_NS = "https://themoviedb.org"

/** Lee un campo `letterboxd:*` del item (con o sin soporte de namespaces). */
function letterboxdField(item, name) {
  return (
    item.getElementsByTagNameNS(LETTERBOXD_NS, name)[0] ||
    item.getElementsByTagName(`letterboxd:${name}`)[0] ||
    null
  )
}

/** ID de TMDB del item, o null si Letterboxd no lo enlaza con ninguna película. */
function tmdbMovieId(item) {
  const node =
    item.getElementsByTagNameNS(TMDB_NS, "movieId")[0] ||
    item.getElementsByTagName("tmdb:movieId")[0]
  return Number(node?.textContent) || null
}

/** `describe` recibe el diccionario: el aviso sigue al idioma aunque cambie después. */
function feedError(describe, retryable = true) {
  const error = new Error()
  error.describe = describe
  error.retryable = retryable
  return error
}

/** Error que no cambia al repetir la misma búsqueda. */
const permanentError = (describe) => feedError(describe, false)

export function useLetterboxdFeed() {
  const t = useMessages()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [describeError, setDescribeError] = useState(null)
  const [canRetry, setCanRetry] = useState(false)
  const [username, setUsername] = useState(null)
  const requestIdRef = useRef(0)
  const controllerRef = useRef(null)

  const fetchMovies = useCallback(async (url) => {
    if (!url?.trim()) return

    // Solo la última búsqueda puede escribir en el estado.
    const requestId = ++requestIdRef.current

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, FEED_TIMEOUT_MS)

    setLoading(true)
    setDescribeError(null)

    try {
      const user = parseUsername(url)

      // Evita una petición que el proxy rechazaría de todos modos.
      if (!isValidUsername(user))
        throw permanentError((m) => m.feedErrors.invalidUser)

      const rssUrl = buildRssUrl(user)
      let res
      try {
        res = await fetch(rssUrl, { signal: controller.signal })
      } catch {
        throw feedError((m) => m.feedErrors.offline)
      }
      if (requestId !== requestIdRef.current) return []
      if (res.status === 404)
        throw permanentError((m) => m.feedErrors.notFound(user))
      if (res.status === 429)
        throw feedError((m) => m.feedErrors.rateLimited)
      if (!res.ok)
        throw feedError((m) => m.feedErrors.upstream)
      const xmlText = await res.text()
      if (requestId !== requestIdRef.current) return []
      const parser = new DOMParser()
      const xml = parser.parseFromString(xmlText, "text/xml")
      // El feed también trae listas y otras entradas sin película: se ignoran.
      const items = Array.from(xml.querySelectorAll("item"))
        .filter((item) => letterboxdField(item, "filmTitle")?.textContent)
        .slice(0, FEED_LIMIT)

      if (items.length === 0)
        throw permanentError((m) => m.feedErrors.empty(user))

      const parsed = items.map((item) => {
        const rawTitleNode = item.querySelector("title")?.textContent || ""

        const title = letterboxdField(item, "filmTitle").textContent

        const link = safeFilmLink(item.querySelector("link")?.textContent?.trim()) || "#"
        const description = item.querySelector("description")?.textContent || ""

        const ratingNode = letterboxdField(item, "memberRating")

        let movieRating = ratingNode ? parseFloat(ratingNode.textContent) : null

        if (!movieRating) {
          const starMatch = rawTitleNode.match(/ - ([★½]+)$/)
          if (starMatch) {
            const starsText = starMatch[1]
            const full = (starsText.match(/★/g) || []).length
            const half = starsText.includes("½") ? 0.5 : 0
            movieRating = full + half
          }
        }

        if (!movieRating) {
          movieRating = extractRating(description)
        }

        const yearNode = letterboxdField(item, "filmYear")
        const field = (name) => letterboxdField(item, name)?.textContent?.trim() || null

        return {
          title,
          link,
          poster: extractPoster(description),
          rating: movieRating,
          year: yearNode ? yearNode.textContent : null,
          tmdbId: tmdbMovieId(item),
          watchedDate: field("watchedDate"),
          liked: field("memberLike") === "Yes",
          rewatch: field("rewatch") === "Yes",
        }
      })

      // Lo anterior sigue en pantalla hasta tener un feed válido que lo reemplace.
      setUsername(user)
      setMovies(parsed)
      return parsed
    } catch (e) {
      if (requestId === requestIdRef.current) {
        const describe = timedOut
          ? (m) => m.feedErrors.timeout
          : e.describe || ((m) => e.message || m.feedErrors.unexpected)
        setDescribeError(() => describe)
        setCanRetry(e.retryable !== false)
      }
      return []
    } finally {
      clearTimeout(timeoutId)
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const cancelFeed = useCallback(() => {
    requestIdRef.current += 1
    controllerRef.current?.abort()
    setLoading(false)
  }, [])

  const resetFeed = useCallback(() => {
    cancelFeed()
    setMovies([])
    setUsername(null)
    setDescribeError(null)
  }, [cancelFeed])

  const error = describeError ? describeError(t) : null

  return { movies, loading, error, canRetry, username, fetchMovies, cancelFeed, resetFeed, setMovies }
}
