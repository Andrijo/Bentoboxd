import { useState, useCallback, useReducer } from "react"
import HighLowGame from "./HighLowGame.jsx"
import QuizModal from "./components/QuizModal/QuizModal.jsx"
import AppHeader from "./components/AppHeader.jsx"
import SearchSection from "./components/SearchSection.jsx"
import MovieViews from "./components/MovieViews.jsx"
import DataPanels from "./components/DataPanels.jsx"
import EmptyLanding from "./components/EmptyLanding.jsx"
import { fetchMetadataFromTMDB } from "./services/tmdb.js"
import { extractPoster, extractRating } from "./services/letterboxd.js"
const initialMetadata = {
  genres: {},
  directors: {},
  actors: {},
  countries: {},
  platforms: {},
  loadingGenres: false,
  genreError: null,
  showQuiz: false,
}

function metadataReducer(state, action) {
  switch (action.type) {
    case "SET_METADATA":
      return { ...state, ...action.payload }
    case "RESET_METADATA":
      return { ...initialMetadata }
    case "SET_LOADING":
      return { ...state, loadingGenres: action.payload }
    case "SET_ERROR":
      return { ...state, genreError: action.payload }
    default:
      return state
  }
}

export default function App() {
  const [url, setUrl] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState(null)
  const [movieViewMode, setMovieViewMode] = useState("bento")
  const [recentProfiles, setRecentProfiles] = useState(() => {
    const saved = localStorage.getItem("letterboxd_recent_profiles:v1")
    return saved ? JSON.parse(saved) : []
  })
  const [showHighLowGame, setShowHighLowGame] = useState(false)
  const [meta, dispatchMeta] = useReducer(metadataReducer, initialMetadata)

  const fetchMovies = useCallback(async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setMovies([])
    dispatchMeta({ type: "RESET_METADATA" })

    try {
      let user = url.trim()
      const match = user.match(/letterboxd\.com\/([^/]+)/)
      if (match) user = match[1]
      else user = user.replace(/^@/, "")

      setUsername(user)

      setRecentProfiles((prev) => {
        const updated = [user, ...prev.filter((p) => p !== user)].slice(0, 3)
        localStorage.setItem(
          "letterboxd_recent_profiles:v1",
          JSON.stringify(updated),
        )
        return updated
      })

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
        let movieRating = ratingNode
          ? parseFloat(ratingNode.textContent)
          : null
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

      dispatchMeta({ type: "SET_LOADING", payload: true })
      try {
        const titles = parsed.map((m) => m.title)
        const metadata = await fetchMetadataFromTMDB(titles)
        setMovies((prev) =>
          prev.map((m) => {
            const meta = metadata.rawResults.find(
              (r) => r && r.title === m.title,
            )
            return {
              ...m,
              platforms: meta?.platforms || [],
              metrics: {
                rating: meta?.globalRating
                  ? parseFloat(meta.globalRating)
                  : 0,
                popularity: meta?.popularity || 0,
                year: meta?.releaseDate
                  ? parseInt(meta.releaseDate.split("-")[0])
                  : 0,
              },
            }
          }),
        )
        dispatchMeta({
          type: "SET_METADATA",
          payload: {
            genres: metadata.genres,
            directors: metadata.directors,
            actors: metadata.actors,
            countries: metadata.countries,
            platforms: metadata.platforms,
          },
        })
      } catch (ge) {
        dispatchMeta({
          type: "SET_ERROR",
          payload:
            "No se pudieron clasificar los géneros: " +
            (ge.message || "Error inesperado"),
        })
      } finally {
        dispatchMeta({ type: "SET_LOADING", payload: false })
      }
    } catch (e) {
      setError(e.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }, [url])

  const resetToStart = useCallback(() => {
    setUrl("")
    setMovies([])
    setUsername(null)
    setError(null)
    setLoading(false)
    dispatchMeta({ type: "RESET_METADATA" })
  }, [])

  const showGenrePanel = movies.length > 0 || meta.loadingGenres

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #111315, #181818)",
        color: "#DBD5CA",
        fontFamily: "'Space Mono', monospace",
        padding: "0",
      }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital@0;1&display=swap');
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
        .rd-header-title { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; line-height: 1; margin: 0; cursor: pointer; background: linear-gradient(135deg, #f8f9fa 0%, rgba(255,255,255,0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .rd-hlg-close-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: all 0.2s; width: 100px; }
        .rd-hlg-container { position: fixed; inset: 0; z-index: 9999; background-color: #181818; display: flex; flex-direction: column; overflow: hidden; font-family: 'Space Mono', monospace; }
        .rd-rank-circle { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 12px; font-family: 'Bebas Neue', sans-serif; font-size: 1rem; }
        .rd-no-poster { position: absolute; inset: 0; background: linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 25%, rgba(10,10,10,0.3) 55%, transparent 100%); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.15); font-size: 2rem; }
        .rd-index-badge { position: absolute; top: 8px; right: 8px; z-index: 10; width: 25px; height: 25px; border-radius: 50%; background: rgba(0,0,0,0.7); border: 1px solid rgba(0,229,255,0.3); display: flex; align-items: center; justify-content: center; color: rgba(0,229,255,0.7); font-family: 'Space Mono', monospace; font-size: 0.75rem; -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
        .rd-country-name { flex: 1; color: #DBD5CA; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .rd-timeline-row { display: flex; gap: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 4px; align-items: center; cursor: pointer; transition: background 0.2s; }
        .rd-terminal-box { background: #050505; border: 1px solid rgba(0,229,255,0.2); padding: 24px; border-radius: 4px; font-family: 'Space Mono', monospace; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); position: relative; overflow: hidden; }
        .rd-terminal-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 4px, 3px 100%; pointer-events: none; }
        .rd-modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(10,10,10,0.9); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Space Mono', monospace; }
        .rd-modal-content { background: #121212; border: 1px solid rgba(0,229,255,0.3); box-shadow: 0 0 30px rgba(0,229,255,0.1); border-radius: 4px; width: 100%; max-width: 500px; overflow: hidden; position: relative; }
        .rd-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: rgba(255,255,255,0.5); font-size: 1.2rem; cursor: pointer; z-index: 10; }
        .rd-profile-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #DBD5CA; padding: 8px 16px; border-radius: 3px; font-family: 'Space Mono', monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .rd-search-input { flex: 1; min-width: 260px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 3px; padding: 12px 16px; color: #E5E5E5; font-family: 'Space Mono', monospace; transition: border 0.2s; }
        .rd-search-btn { padding: 12px 28px; border-radius: 3px; font-family: 'Space Mono', monospace; font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; transition: all 0.2s; width: 160px; text-align: center; }
      `}</style>

      <AppHeader
        movies={movies}
        onReset={resetToStart}
        onShowQuiz={() =>
          dispatchMeta({
            type: "SET_METADATA",
            payload: { showQuiz: true },
          })
        }
        onShowGame={() => setShowHighLowGame(true)}
      />

      <SearchSection
        url={url}
        loading={loading}
        onUrlChange={setUrl}
        onFetch={fetchMovies}
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
              fontSize: "0.75rem",
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
        genres={meta.genres}
        directors={meta.directors}
        actors={meta.actors}
        countries={meta.countries}
        platforms={meta.platforms}
        loadingGenres={meta.loadingGenres}
        genreError={meta.genreError}
      />

      <EmptyLanding
        loading={loading}
        movies={movies}
        error={error}
        recentProfiles={recentProfiles}
        onProfileSelect={(user) => {
          setUrl(user)
          setTimeout(() => fetchMovies(), 10)
        }}
      />

      {showHighLowGame && (
        <HighLowGame movies={movies} onClose={() => setShowHighLowGame(false)} />
      )}

      {meta.showQuiz && (
        <QuizModal
          movies={movies}
          onClose={() =>
            dispatchMeta({
              type: "SET_METADATA",
              payload: { showQuiz: false },
            })
          }
        />
      )}
    </div>
  )
}
