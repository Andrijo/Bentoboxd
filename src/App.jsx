import { useState, useCallback, useEffect, useRef } from "react"
import HighLowGame from "./HighLowGame.jsx"
import Quiz from "./components/Quiz/Quiz.jsx"
import AppHeader from "./components/AppHeader.jsx"
import AppFooter from "./components/AppFooter.jsx"
import SearchSection from "./components/SearchSection.jsx"
import MovieViews from "./components/MovieViews.jsx"
import DataPanels from "./components/DataPanels.jsx"
import EmptyLanding from "./components/EmptyLanding.jsx"
import { BentoSkeleton } from "./components/Skeleton.jsx"
import { useLetterboxdFeed } from "./hooks/useLetterboxdFeed.js"
import { useTMDBMetadata } from "./hooks/useTMDBMetadata.js"
import { useHashRoute } from "./hooks/useHashRoute.js"
import { useOverscrollColor } from "./hooks/useOverscrollColor.js"
import { useTheme } from "./hooks/useTheme.js"
import { parseUsername } from "./services/letterboxd.js"
import { readProfileParam, writeProfileParam } from "./utils/profileUrl.js"

export default function App() {
  // Con un enlace compartido (?user=) el buscador arranca con ese usuario.
  const [url, setUrl] = useState(() => readProfileParam() || "")
  const [movieViewMode, setMovieViewMode] = useState("bento")
  const [recentProfiles, setRecentProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem("letterboxd_recent_profiles:v1")
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [route, navigate] = useHashRoute()
  const requestIdRef = useRef(0)
  const mainRef = useRef(null)
  useOverscrollColor()
  const [theme, toggleTheme] = useTheme()

  const {
    movies,
    loading: feedLoading,
    error,
    username,
    fetchMovies: fetchFeed,
    resetFeed,
    setMovies,
  } = useLetterboxdFeed()

  const {
    genres,
    directors,
    actors,
    countries,
    platforms,
    loading: metaLoading,
    error: genreError,
    fetchMetadata,
    resetMetadata,
  } = useTMDBMetadata()

  useEffect(() => {
    try {
      localStorage.setItem(
        "letterboxd_recent_profiles:v1",
        JSON.stringify(recentProfiles),
      )
    } catch {
      // Almacenamiento no disponible (modo privado o cuota llena)
    }
  }, [recentProfiles])

  const handleFetch = useCallback(
    async (input) => {
      // SearchSection llama con el evento del click; los perfiles con un string.
      const target = (typeof input === "string" ? input : url).trim()
      if (!target) return

      // Ignora respuestas de búsquedas que ya fueron reemplazadas.
      const requestId = ++requestIdRef.current

      resetMetadata()

      const parsed = await fetchFeed(target)
      if (requestId !== requestIdRef.current) return
      if (!parsed?.length) return

      // Solo se recuerdan perfiles cuyo feed cargó.
      const user = parseUsername(target)
      setRecentProfiles((prev) =>
        [user, ...prev.filter((p) => p !== user)].slice(0, 3),
      )
      // También solo entonces va a la URL, para poder compartirla o recargar.
      writeProfileParam(user)

      const metadata = await fetchMetadata(
        parsed.map((m) => ({ title: m.title, year: m.year })),
      )
      if (requestId !== requestIdRef.current) return
      if (!metadata) return

      setMovies((prev) =>
        prev.map((m) => {
          const found = metadata.rawResults.find(
            (r) =>
              r &&
              r.title === m.title.trim() &&
              (r.queryYear == null ||
                !m.year ||
                String(r.queryYear) === String(m.year).trim()),
          )
          const releaseYear = found?.releaseDate
            ? parseInt(found.releaseDate.split("-")[0], 10)
            : 0
          const fallbackYear = m.year ? parseInt(m.year, 10) : 0

          return {
            ...m,
            platforms: found?.platforms || [],
            genres: found?.genres || [],
            directors: found?.directors || [],
            metrics: {
              rating: found?.globalRating ? parseFloat(found.globalRating) : 0,
              popularity: found?.popularity || 0,
              runtime: found?.runtime || 0,
              year: releaseYear || fallbackYear,
            },
          }
        }),
      )
    },
    [url, fetchFeed, fetchMetadata, resetMetadata, setMovies],
  )

  const clearProfile = useCallback(() => {
    requestIdRef.current += 1
    setUrl("")
    resetFeed()
    resetMetadata()
  }, [resetFeed, resetMetadata])

  const resetToStart = useCallback(() => {
    navigate("profile")
    // navigate conserva el query; aquí el usuario sobra.
    writeProfileParam(null, { replace: true })
    clearProfile()
  }, [navigate, clearProfile])

  // Los efectos de abajo siempre usan la última versión sin re-suscribirse.
  const handleFetchRef = useRef(handleFetch)
  const usernameRef = useRef(username)
  useEffect(() => {
    handleFetchRef.current = handleFetch
    usernameRef.current = username
  })

  // Carga el perfil de la URL (enlace compartido o recarga, incluso en #quiz).
  useEffect(() => {
    const user = readProfileParam()
    if (user) handleFetchRef.current(user)
  }, [])

  // Atrás/adelante entre perfiles: solo cambia algo si cambió el usuario,
  // no al moverse entre pestañas del mismo perfil.
  useEffect(() => {
    const sync = () => {
      const user = readProfileParam()
      if (user === usernameRef.current) return
      if (!user) {
        clearProfile()
        return
      }
      setUrl(user)
      handleFetchRef.current(user)
    }
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [clearProfile])

  useEffect(() => {
    document.title = username && movies.length > 0
      ? `@${username} — Bentoboxd`
      : "Bentoboxd — Tu Letterboxd en un dashboard"
  }, [username, movies.length])

  const showGenrePanel = movies.length > 0 || metaLoading
  // Sin feed cargado (p. ej. al recargar en #quiz) solo existe el perfil.
  const hasMovies = movies.length > 0
  const page = hasMovies ? route : "profile"

  return (
    <div
      className="rd-app"
      style={{
        color: "var(--c-text)",
        fontFamily: "var(--font-mono)",
        padding: "0",
      }}>
      {/* Sin cambiar el hash: useHashRoute lo usa para la página activa. */}
      <a
        href="#contenido"
        className="rd-skip-link"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}>
        Saltar al contenido
      </a>

      <AppHeader
        page={page}
        showTabs={hasMovies}
        theme={theme}
        onNavigate={navigate}
        onReset={resetToStart}
        onToggleTheme={toggleTheme}
      />

      <main ref={mainRef} id="contenido" tabIndex={-1} style={{ outline: "none", flex: 1 }}>
      {/* El perfil solo se oculta para conservar su estado entre pestañas. */}
      <div hidden={page !== "profile"}>
        <SearchSection
          url={url}
          loading={feedLoading}
          onUrlChange={setUrl}
          onFetch={handleFetch}
        />

        {error && (
          <div className="rd-error-box" role="alert">
            <span>⚠ {error}</span>
            <button type="button" className="rd-error-retry" onClick={() => handleFetch(url)}>
              Reintentar
            </button>
          </div>
        )}

        {feedLoading && <BentoSkeleton />}

        {movies.length > 0 && (
          <MovieViews
            movies={movies}
            movieViewMode={movieViewMode}
            username={username}
            onViewModeChange={setMovieViewMode}
          />
        )}

        <DataPanels
          showGenrePanel={showGenrePanel}
          movies={movies}
          genres={genres}
          directors={directors}
          actors={actors}
          countries={countries}
          platforms={platforms}
          loadingGenres={metaLoading}
          genreError={genreError}
        />

        <EmptyLanding
          loading={feedLoading}
          movies={movies}
          error={error}
          recentProfiles={recentProfiles}
          onProfileSelect={(user) => {
            setUrl(user)
            handleFetch(user)
          }}
        />
      </div>

      {page === "higher-lower" && (
        <HighLowGame key={username} movies={movies} loading={metaLoading} />
      )}

      {page === "quiz" && (
        <Quiz
          key={username}
          movies={movies}
          loading={metaLoading}
          onBack={() => navigate("profile")}
        />
      )}
      </main>

      <AppFooter />
    </div>
  )
}
