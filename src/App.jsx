import { useState, useCallback, useEffect, useRef } from "react"
import HighLowGame from "./HighLowGame.jsx"
import Quiz from "./components/Quiz/Quiz.jsx"
import AppHeader from "./components/AppHeader.jsx"
import AppFooter from "./components/AppFooter.jsx"
import SearchSection from "./components/SearchSection.jsx"
import MovieViews from "./components/MovieViews.jsx"
import DataPanels from "./components/DataPanels.jsx"
import EmptyLanding from "./components/EmptyLanding.jsx"
import ErrorNotice from "./components/ErrorNotice.jsx"
import KeepAlive from "./components/KeepAlive.jsx"
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
    canRetry,
    username,
    fetchMovies: fetchFeed,
    cancelFeed,
    resetFeed,
    setMovies,
  } = useLetterboxdFeed()

  const {
    genres,
    directors,
    actors,
    countries,
    platforms,
    coverage,
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

  const loadMetadata = useCallback(
    async (feedMovies) => {
      // Ignora respuestas de cargas que ya fueron reemplazadas.
      const requestId = ++requestIdRef.current

      const metadata = await fetchMetadata(
        feedMovies.map((m) => ({ title: m.title, year: m.year })),
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
    [fetchMetadata, setMovies],
  )

  const handleFetch = useCallback(
    async (input) => {
      // SearchSection llama con el evento del click; los perfiles con un string.
      const target = (typeof input === "string" ? input : url).trim()
      if (!target) return

      // Vacío si falló o fue reemplazada: el perfil anterior sigue intacto.
      const parsed = await fetchFeed(target)
      if (!parsed?.length) return

      // Solo se recuerdan perfiles cuyo feed cargó.
      const user = parseUsername(target)
      setRecentProfiles((prev) =>
        [user, ...prev.filter((p) => p !== user)].slice(0, 3),
      )
      // También solo entonces va a la URL, para poder compartirla o recargar.
      writeProfileParam(user)

      resetMetadata()
      await loadMetadata(parsed)
    },
    [url, fetchFeed, loadMetadata, resetMetadata],
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
          onCancel={cancelFeed}
        />

        {error && (
          <ErrorNotice
            message={error}
            onRetry={canRetry ? () => handleFetch(url) : undefined}
          />
        )}

        {feedLoading && !hasMovies && <BentoSkeleton />}

        {hasMovies && (
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
          coverage={coverage}
          loadingGenres={metaLoading}
          genreError={genreError}
          onRetryMetadata={() => loadMetadata(movies)}
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
          onProfileRemove={(user) => {
            setRecentProfiles((prev) => prev.filter((p) => p !== user))
          }}
        />
      </div>

      {/* Las partidas se conservan entre pestañas y se reinician por perfil. */}
      {hasMovies && (
        <KeepAlive key={`higher-lower:${username}`} active={page === "higher-lower"}>
          <HighLowGame
            movies={movies}
            loading={metaLoading}
            active={page === "higher-lower"}
          />
        </KeepAlive>
      )}

      {hasMovies && (
        <KeepAlive key={`quiz:${username}`} active={page === "quiz"}>
          <Quiz
            movies={movies}
            loading={metaLoading}
            onBack={() => navigate("profile")}
          />
        </KeepAlive>
      )}
      </main>

      <AppFooter />
    </div>
  )
}
