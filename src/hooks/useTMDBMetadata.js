import { useState, useCallback } from "react"
import { fetchMetadataFromTMDB } from "../services/tmdb.js"

export function useTMDBMetadata() {
  const [genres, setGenres] = useState({})
  const [directors, setDirectors] = useState({})
  const [actors, setActors] = useState({})
  const [countries, setCountries] = useState({})
  const [platforms, setPlatforms] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetadata = useCallback(async (movieTitles) => {
    if (!movieTitles?.length) return null
    setLoading(true)
    setError(null)

    try {
      const metadata = await fetchMetadataFromTMDB(movieTitles)
      setGenres(metadata.genres)
      setDirectors(metadata.directors)
      setActors(metadata.actors)
      setCountries(metadata.countries)
      setPlatforms(metadata.platforms)
      return metadata
    } catch (e) {
      setError(
        "No se pudieron clasificar los géneros: " +
          (e.message || "Error inesperado"),
      )
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const resetMetadata = useCallback(() => {
    setGenres({})
    setDirectors({})
    setActors({})
    setCountries({})
    setPlatforms({})
    setError(null)
    setLoading(false)
  }, [])

  return {
    genres, directors, actors, countries, platforms,
    loading, error, fetchMetadata, resetMetadata,
    setGenres, setDirectors, setActors, setCountries, setPlatforms,
  }
}
