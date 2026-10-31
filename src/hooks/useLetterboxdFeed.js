import { useState, useCallback, useRef } from "react"
import {
  isValidUsername,
  parseUsername,
  buildRssUrl,
  extractPoster,
  extractRating,
  safeFilmLink,
} from "../services/letterboxd.js"

/** Máximo de películas leídas del feed (el RSS de Letterboxd trae ~50). */
export const FEED_LIMIT = 50

const FEED_TIMEOUT_MS = 15000

const LETTERBOXD_NS = "https://letterboxd.com"

/** Lee un campo `letterboxd:*` del item (con o sin soporte de namespaces). */
function letterboxdField(item, name) {
  return (
    item.getElementsByTagNameNS(LETTERBOXD_NS, name)[0] ||
    item.getElementsByTagName(`letterboxd:${name}`)[0] ||
    null
  )
}

/** Error que no cambia al repetir la misma búsqueda. */
function permanentError(message) {
  const error = new Error(message)
  error.retryable = false
  return error
}

export function useLetterboxdFeed() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
    setError(null)

    try {
      const user = parseUsername(url)

      // Evita una petición que el proxy rechazaría de todos modos.
      if (!isValidUsername(user))
        throw permanentError(
          "Usuario inválido. Usa solo letras, números, guiones o guiones bajos.",
        )

      const rssUrl = buildRssUrl(user)
      let res
      try {
        res = await fetch(rssUrl, { signal: controller.signal })
      } catch {
        throw new Error("Sin conexión. Revisa tu internet e inténtalo de nuevo.")
      }
      if (requestId !== requestIdRef.current) return []
      if (res.status === 404)
        throw permanentError(
          `No encontramos a @${user} en Letterboxd. Revisa el nombre o que el perfil sea público.`,
        )
      if (res.status === 429)
        throw new Error("Demasiadas búsquedas seguidas. Espera un minuto e inténtalo de nuevo.")
      if (!res.ok)
        throw new Error(
          "Letterboxd no responde en este momento. Inténtalo de nuevo en unos minutos.",
        )
      const xmlText = await res.text()
      if (requestId !== requestIdRef.current) return []
      const parser = new DOMParser()
      const xml = parser.parseFromString(xmlText, "text/xml")
      // El feed también trae listas y otras entradas sin película: se ignoran.
      const items = Array.from(xml.querySelectorAll("item"))
        .filter((item) => letterboxdField(item, "filmTitle")?.textContent)
        .slice(0, FEED_LIMIT)

      if (items.length === 0)
        throw permanentError(`No se encontraron películas en el diario público de @${user}.`)

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
        setError(
          timedOut
            ? "Letterboxd tardó demasiado en responder. Inténtalo de nuevo."
            : e.message || "Error inesperado",
        )
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
    setError(null)
  }, [cancelFeed])

  return { movies, loading, error, canRetry, username, fetchMovies, cancelFeed, resetFeed, setMovies }
}
