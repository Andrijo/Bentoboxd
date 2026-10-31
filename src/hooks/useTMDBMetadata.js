import { useState, useCallback, useEffect, useRef } from "react"
import { fetchMetadataFromTMDB } from "../services/tmdb.js"

export function useTMDBMetadata() {
  const [genres, setGenres] = useState({})
  const [directors, setDirectors] = useState({})
  const [actors, setActors] = useState({})
  const [countries, setCountries] = useState({})
  const [platforms, setPlatforms] = useState({})
  const [coverage, setCoverage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  // Cancela la petición en curso al desmontar.
  useEffect(
    () => () => {
      controllerRef.current?.abort()
      controllerRef.current = null
    },
    [],
  )

  const fetchMetadata = useCallback(async (movies) => {
    if (!movies?.length) return null

    // Cancela una carga anterior antes de empezar la nueva.
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)
    setCoverage(null)

    try {
      const metadata = await fetchMetadataFromTMDB(movies, {
        signal: controller.signal,
      })
      setGenres(metadata.genres)
      setDirectors(metadata.directors)
      setActors(metadata.actors)
      setCountries(metadata.countries)
      setPlatforms(metadata.platforms)
      setCoverage(metadata.coverage)
      return metadata
    } catch (e) {
      if (e.name === "AbortError") return null
      console.error(e)
      setError("No pudimos cargar los datos de TMDB. Inténtalo de nuevo en unos minutos.")
      return null
    } finally {
      // Solo la petición vigente controla el estado de carga.
      if (controllerRef.current === controller) {
        controllerRef.current = null
        setLoading(false)
      }
    }
  }, [])

  const resetMetadata = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setGenres({})
    setDirectors({})
    setActors({})
    setCountries({})
    setPlatforms({})
    setCoverage(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    genres, directors, actors, countries, platforms, coverage,
    loading, error, fetchMetadata, resetMetadata,
    setGenres, setDirectors, setActors, setCountries, setPlatforms,
  }
}
