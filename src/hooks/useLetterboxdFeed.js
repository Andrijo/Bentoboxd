import { useState, useCallback } from "react"
import { extractPoster, extractRating } from "../services/letterboxd.js"

export function useLetterboxdFeed() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState(null)

  const fetchMovies = useCallback(async (url) => {
    if (!url?.trim()) return
    setLoading(true)
    setError(null)
    setMovies([])

    try {
      let user = url.trim()
      const match = user.match(/letterboxd\.com\/([^/]+)/)
      if (match) user = match[1]
      else user = user.replace(/^@/, "")

      setUsername(user)

      const rssUrl = `/rss-proxy/${user}/rss/`
      const res = await fetch(rssUrl)
      if (!res.ok)
        throw new Error(
          "No se pudo obtener el feed. Verifica el usuario o tu conexión.",
        )
      const xmlText = await res.text()
      const parser = new DOMParser()
      const xml = parser.parseFromString(xmlText, "text/xml")
      const items = Array.from(xml.querySelectorAll("item")).slice(0, 15)

      if (items.length === 0)
        throw new Error("No se encontraron películas. Verifica el usuario.")

      const parsed = items.map((item) => {
        const rawTitleNode = item.querySelector("title")?.textContent || ""

        const title =
          item.querySelector("filmTitle")?.textContent ||
          rawTitleNode.split(",")[0] ||
          "Unknown"

        const link = item.querySelector("link")?.textContent || "#"
        const description = item.querySelector("description")?.textContent || ""

        const ratingNode =
          item.getElementsByTagNameNS(
            "https://letterboxd.com",
            "memberRating",
          )[0] || item.getElementsByTagName("letterboxd:memberRating")[0]

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

        const yearNode =
          item.getElementsByTagNameNS(
            "https://letterboxd.com",
            "filmYear",
          )[0] || item.getElementsByTagName("letterboxd:filmYear")[0]

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
      setError(e.message || "Error inesperado")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { movies, loading, error, username, fetchMovies, setMovies }
}
