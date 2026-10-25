import { useState, useCallback, useRef } from "react"
import {
  isValidUsername,
  parseUsername,
  buildRssUrl,
  extractPoster,
  extractRating,
} from "../services/letterboxd.js"

/** Máximo de películas leídas del feed (el RSS de Letterboxd trae ~50). */
export const FEED_LIMIT = 50

const LETTERBOXD_NS = "https://letterboxd.com"

/** Lee un campo `letterboxd:*` del item (con o sin soporte de namespaces). */
function letterboxdField(item, name) {
  return (
    item.getElementsByTagNameNS(LETTERBOXD_NS, name)[0] ||
    item.getElementsByTagName(`letterboxd:${name}`)[0] ||
    null
  )
}

export function useLetterboxdFeed() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState(null)
  const requestIdRef = useRef(0)

  const fetchMovies = useCallback(async (url) => {
    if (!url?.trim()) return

    // Solo la última búsqueda puede escribir en el estado.
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)
    setMovies([])

    try {
      const user = parseUsername(url)

      // Evita una petición que el proxy rechazaría de todos modos.
      if (!isValidUsername(user))
        throw new Error(
          "Usuario inválido. Usa solo letras, números, guiones o guiones bajos.",
        )

      setUsername(user)

      const rssUrl = buildRssUrl(user)
      const res = await fetch(rssUrl)
      if (requestId !== requestIdRef.current) return []
      if (!res.ok)
        throw new Error(
          "No se pudo obtener el feed. Verifica el usuario o tu conexión.",
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
        throw new Error("No se encontraron películas. Verifica el usuario.")

      const parsed = items.map((item) => {
        const rawTitleNode = item.querySelector("title")?.textContent || ""

        const title = letterboxdField(item, "filmTitle").textContent

        const link = item.querySelector("link")?.textContent || "#"
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

        return {
          title,
          link,
          poster: extractPoster(description),
          rating: movieRating,
          year: yearNode ? yearNode.textContent : null,
        }
      })

      setMovies(parsed)
      return parsed
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setError(e.message || "Error inesperado")
      }
      return []
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const resetFeed = useCallback(() => {
    requestIdRef.current += 1
    setMovies([])
    setUsername(null)
    setError(null)
    setLoading(false)
  }, [])

  return { movies, loading, error, username, fetchMovies, resetFeed, setMovies }
}
