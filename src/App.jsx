import { useState, useCallback, useEffect, useRef } from "react"
import HighLowGame from "./HighLowGame.jsx"
import QuizModal from "./components/QuizModal/QuizModal.jsx"
import AppHeader from "./components/AppHeader.jsx"
import SearchSection from "./components/SearchSection.jsx"
import MovieViews from "./components/MovieViews.jsx"
import DataPanels from "./components/DataPanels.jsx"
import EmptyLanding from "./components/EmptyLanding.jsx"
import { useLetterboxdFeed } from "./hooks/useLetterboxdFeed.js"
import { useTMDBMetadata } from "./hooks/useTMDBMetadata.js"
import { parseUsername } from "./services/letterboxd.js"

export default function App() {
  const [url, setUrl] = useState("")
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
  const [showHighLowGame, setShowHighLowGame] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const requestIdRef = useRef(0)

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

      setShowQuiz(false)
      resetMetadata()

      const parsed = await fetchFeed(target)
      if (requestId !== requestIdRef.current) return
      if (!parsed?.length) return

      // Solo se recuerdan perfiles cuyo feed cargó.
      const user = parseUsername(target)
      setRecentProfiles((prev) =>
        [user, ...prev.filter((p) => p !== user)].slice(0, 3),
      )

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

  const resetToStart = useCallback(() => {
    requestIdRef.current += 1
    setUrl("")
    setShowQuiz(false)
    resetFeed()
    resetMetadata()
  }, [resetFeed, resetMetadata])

  const loading = feedLoading || metaLoading
  const showGenrePanel = movies.length > 0 || metaLoading

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #111312, #181818)",
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none; border-color: rgba(19,63,67,0.5) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 2px; }
        .rd-error-box { margin: 24px 40px; padding: 14px 20px; border: 1px solid rgba(255,80,80,0.3); border-radius: 3px; background: rgba(255,80,80,0.05); color: rgba(255,80,80,0.8); font-size: 0.75rem; letter-spacing: 1px; }
        .rd-header-bar { padding: 48px 40px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
        .rd-header-title { font-family: var(--font-display); letter-spacing: 2px; line-height: 1; margin: 0; cursor: pointer; background: linear-gradient(135deg, #f8f9fa 0%, rgba(255,255,255,0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .rd-hlg-close-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: all 0.2s; width: 100px; }
        .rd-hlg-container { position: fixed; inset: 0; z-index: 9999; background-color: #181818; display: flex; flex-direction: column; overflow: hidden; font-family: var(--font-mono); }
        .rd-rank-circle { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 12px; font-family: var(--font-display); font-size: 1rem; }
        .rd-no-poster { position: absolute; inset: 0; background: linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 25%, rgba(10,10,10,0.3) 55%, transparent 100%); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.15); font-size: 2rem; }
        .rd-index-badge { position: absolute; top: 8px; right: 8px; z-index: 10; width: 25px; height: 25px; border-radius: 50%; background: rgba(0,0,0,0.7); border: 1px solid rgba(0,229,255,0.3); display: flex; align-items: center; justify-content: center; color: rgba(0,229,255,0.7); font-family: var(--font-mono); font-size: 0.75rem; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
        .rd-country-name { flex: 1; color: #DBD5CA; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rd-timeline-row { display: flex; gap: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 4px; align-items: center; cursor: pointer; transition: background 0.2s; }
        .rd-terminal-box { background: #050505; border: 1px solid rgba(0,229,255,0.2); padding: 24px; border-radius: 4px; font-family: var(--font-mono); box-shadow: inset 0 0 20px rgba(0,0,0,0.8); position: relative; overflow: hidden; }
        .rd-terminal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 4px, 3px 100%; pointer-events: none; }
        .rd-modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(10,10,10,0.9); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; font-family: var(--font-mono); }
        .rd-modal-content { background: #121212; border: 1px solid rgba(0,229,255,0.3); box-shadow: 0 0 30px rgba(0,229,255,0.1); border-radius: 4px; width: 100%; max-width: 500px; overflow: hidden; position: relative; }
        .rd-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: rgba(255,255,255,0.5); font-size: 1.2rem; cursor: pointer; z-index: 10; }
        .rd-profile-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #DBD5CA; padding: 8px 16px; border-radius: 3px; font-family: var(--font-mono); font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .rd-search-input { flex: 1; min-width: 260px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 3px; padding: 12px 16px; color: #E5E5E5; font-family: var(--font-mono); transition: border 0.2s; }
        .rd-search-btn { padding: 12px 28px; border-radius: 3px; font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; transition: all 0.2s; width: 160px; text-align: center; }
      `}</style>

      <AppHeader
        movies={movies}
        onReset={resetToStart}
        onShowQuiz={() => setShowQuiz(true)}
        onShowGame={() => setShowHighLowGame(true)}
      />

      <SearchSection
        url={url}
        loading={loading}
        onUrlChange={setUrl}
        onFetch={handleFetch}
      />

      {error && (
        <div className="rd-error-box">
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "48px 40px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "var(--fs-xs)",
              letterSpacing: "4px",
              color: "rgba(0,229,255,0.5)",
              animation: "pulse 1.2s ease infinite",
            }}>
            ◈ Obteniendo películas...
          </div>
        </div>
      )}

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
        loading={loading}
        movies={movies}
        error={error}
        recentProfiles={recentProfiles}
        onProfileSelect={(user) => {
          setUrl(user)
          handleFetch(user)
        }}
      />

      {showHighLowGame && (
        <HighLowGame movies={movies} onClose={() => setShowHighLowGame(false)} />
      )}

      {showQuiz && (
        <QuizModal
          movies={movies}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  )
}
