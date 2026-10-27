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
            metrics: {
              rating: found?.globalRating ? parseFloat(found.globalRating) : 0,
              popularity: found?.popularity || 0,
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
        color: "#DBD5CA",
        fontFamily: "var(--font-mono)",
        padding: "0",
      }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(0,229,255,0.3); }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        input::placeholder { color: rgba(255,255,255,0.5); }
        input:focus { outline: none; border-color: rgba(0,229,255,0.5) !important; }
        :focus-visible { outline: 2px solid rgba(0,229,255,0.7); outline-offset: 2px; }
        input:focus-visible { outline: none; }
        .rd-skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.6s linear infinite; }
        /* Columna a pantalla completa: el footer queda al fondo aunque haya poco contenido. */
        .rd-app { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; }
        /* Recortado y no desplazado fuera de pantalla: así el rebote del overscroll no lo deja asomar. */
        .rd-skip-link:not(:focus) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
        .rd-skip-link:focus { position: absolute; left: var(--gutter); top: 12px; z-index: 100; padding: 10px 16px; border-radius: var(--radius-md); background: #00e5ff; color: #000; font-size: var(--fs-xs); letter-spacing: 1px; text-decoration: none; }
        .rd-footer { margin-top: 24px; padding: 32px var(--gutter) 40px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 10px; font-size: var(--fs-xs); line-height: 1.6; color: rgba(255,255,255,0.6); }
        .rd-panel-title { font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: normal; letter-spacing: 2px; color: #F0EDE5; line-height: 1; }
        .rd-bento-panels { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-areas: "stats" "genres" "platforms" "directors" "actors" "countries"; gap: 24px; margin: 0 var(--gutter) 40px; }
        @media (min-width: 900px) {
          .rd-bento-panels { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-areas: "stats genres" "platforms genres" "directors actors" "countries countries"; }
        }
        .rd-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .rd-timeline-row:hover, .rd-timeline-row:focus-visible { background: rgba(0,229,255,0.05) !important; }
        .rd-hlg-controls { position: relative; flex-shrink: 0; width: clamp(64px, 18vw, 88px); aspect-ratio: 60 / 150; container-type: inline-size; }
        .rd-hlg-arrow { position: absolute; left: 0; width: 100%; height: 33.67%; padding: 0; border: none; background: none; pointer-events: none; transition: opacity 0.3s; }
        .rd-hlg-arrow-up { top: 0; }
        .rd-hlg-arrow-down { bottom: 0; }
        .rd-hlg-arrow svg { display: block; width: 100%; height: 100%; overflow: visible; }
        .rd-hlg-arrow-down svg { transform: rotate(180deg); }
        .rd-hlg-arrow path { pointer-events: auto; cursor: pointer; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); transition: filter 0.15s; }
        .rd-hlg-arrow:not(:disabled) path:hover { filter: brightness(1.15) drop-shadow(0 0 8px rgba(255,255,255,0.25)); }
        .rd-hlg-arrow:disabled { opacity: 0.3; }
        .rd-hlg-arrow:disabled path { pointer-events: none; }
        .rd-hlg-vs { position: absolute; left: 8.333%; top: 33.333%; width: 83.333%; aspect-ratio: 1; border-radius: 50%; background: #facc15; color: #000; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 28cqw; box-shadow: 0 0 20px rgba(250,204,21,0.4); }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; animation-delay: 0ms !important; transition-duration: 0.01ms !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 2px; }
        .rd-error-box { margin: 24px var(--gutter); padding: 14px 20px; border: 1px solid rgba(255,80,80,0.3); border-radius: var(--radius-md); background: rgba(255,80,80,0.05); color: rgba(255,80,80,0.8); font-size: 0.75rem; letter-spacing: 1px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .rd-error-retry { background: none; border: 1px solid rgba(255,80,80,0.4); border-radius: var(--radius-sm); color: inherit; padding: 6px 14px; font-size: var(--fs-xs); letter-spacing: 1px; cursor: pointer; transition: background 0.2s; }
        .rd-error-retry:hover { background: rgba(255,80,80,0.1); }
        .rd-header-bar { padding: clamp(24px, 6vw, 48px) var(--gutter) 32px; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .rd-header-title { font-family: var(--font-display); letter-spacing: 2px; line-height: 1; margin: 0; cursor: pointer; background: linear-gradient(135deg, #f8f9fa 0%, rgba(255,255,255,0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .rd-page { padding: 32px var(--gutter) 48px; animation: fadeSlideIn 0.3s ease both; }
        .rd-page-notice { padding: 48px 0; text-align: center; font-size: var(--fs-xs); letter-spacing: 2px; color: rgba(255,255,255,0.5); }
        .rd-hlg { display: flex; flex-direction: column; min-height: 75vh; overflow-x: hidden; }
        .rd-rank-circle { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 12px; font-family: var(--font-display); font-size: 1rem; line-height: 1; padding-bottom: 3px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
        .rd-no-poster { position: absolute; inset: 0; background: linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 25%, rgba(10,10,10,0.3) 55%, transparent 100%); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.15); font-size: 2rem; }
        .rd-index-badge { position: absolute; top: 8px; right: 8px; z-index: 10; width: 25px; height: 25px; border-radius: 50%; background: rgba(0,0,0,0.7); border: 1px solid rgba(0,229,255,0.3); display: flex; align-items: center; justify-content: center; color: rgba(0,229,255,0.7); font-family: var(--font-mono); font-size: 0.75rem; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
        .rd-country-name { flex: 1; color: #DBD5CA; font-size: 0.85rem; letter-spacing: 1px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rd-timeline-row { display: flex; gap: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: var(--radius-md); align-items: center; cursor: pointer; transition: background 0.2s; }
        .rd-terminal-box { background: #050505; border: 1px solid rgba(0,229,255,0.2); padding: 24px; border-radius: var(--radius-lg); font-family: var(--font-mono); box-shadow: inset 0 0 20px rgba(0,0,0,0.8); position: relative; overflow: hidden; }
        .rd-terminal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 4px, 3px 100%; pointer-events: none; }
        .rd-quiz-card { background: #121212; border: 1px solid rgba(0,229,255,0.3); box-shadow: 0 0 30px rgba(0,229,255,0.1); border-radius: var(--radius-lg); width: 100%; max-width: 560px; margin: 0 auto; overflow: hidden; }
        .rd-profile-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #DBD5CA; padding: 8px 16px; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .rd-search-input { flex: 1; min-width: min(260px, 100%); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 12px 16px; color: #E5E5E5; font-family: var(--font-mono); transition: border 0.2s; }
        .rd-search-btn { padding: 12px 28px; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 2px; transition: all 0.2s; width: 160px; text-align: center; }
        @media (max-width: 640px) {
          .rd-header-actions { width: 100%; }
          /* Las 3 pestañas en una fila aun a 360px ("Higher or Lower" es la más larga). */
          .rd-tab { padding: 8px 10px !important; letter-spacing: 1px !important; flex-basis: auto !important; }
          .rd-search-btn { width: 100%; }
          .rd-timeline-row { gap: 12px; padding: 10px; }
          .rd-timeline-index { display: none; }
          .rd-terminal-box { padding: 16px; }
          /* Selectores: caja a todo el ancho, hasta 3 opciones por fila; las de
             una fila incompleta se estiran para no dejar celdas vacías. */
          .rd-segmented { display: flex !important; width: 100%; margin: 0 auto; }
          .rd-segmented > button { flex: 1 1 30%; text-align: center; justify-content: center; }
        }
      `}</style>

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
        onNavigate={navigate}
        onReset={resetToStart}
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
          onBack={() => navigate("profile")}
        />
      )}
      </main>

      <AppFooter />
    </div>
  )
}
