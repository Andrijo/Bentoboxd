import { useState, useCallback, useEffect, useRef } from "react"
import { fetchMetadataFromTMDB } from "../services/tmdb.js"
import { useMessages } from "../i18n/index.js"

export function useTMDBMetadata() {
  const t = useMessages()
  const [genres, setGenres] = useState({})
  const [directors, setDirectors] = useState({})
  const [actors, setActors] = useState({})
  const [countries, setCountries] = useState({})
  const [platforms, setPlatforms] = useState({})
  const [photos, setPhotos] = useState({})
  const [coverage, setCoverage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
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
    setFailed(false)
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
      setPhotos(metadata.photos)
      setCoverage(metadata.coverage)
      return metadata
    } catch (e) {
      if (e.name === "AbortError") return null
      console.error(e)
      setFailed(true)
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
    setPhotos({})
    setCoverage(null)
    setFailed(false)
    setLoading(false)
  }, [])

  return {
    genres, directors, actors, countries, platforms, photos, coverage,
    loading, error: failed ? t.tmdbError : null, fetchMetadata, resetMetadata,
    setGenres, setDirectors, setActors, setCountries, setPlatforms,
  }
}
