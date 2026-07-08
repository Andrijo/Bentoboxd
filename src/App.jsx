import { useState, useCallback, useMemo, useReducer } from "react"
import HighLowGame from "./HighLowGame.jsx"
import QuizModal from "./components/QuizModal/QuizModal.jsx"
import AppHeader from "./components/AppHeader.jsx"
import SearchSection from "./components/SearchSection.jsx"
import MovieViews from "./components/MovieViews.jsx"
import DataPanels from "./components/DataPanels.jsx"
import EmptyLanding from "./components/EmptyLanding.jsx"
import { fetchMetadataFromTMDB } from "./services/tmdb.js"
import { extractPoster, extractRating } from "./services/letterboxd.js"
import { BENTO_PATTERNS } from "./components/BentoGrid/bentoPatterns.js"

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
    const saved = localStorage.getItem("letterboxd_recent_profiles")
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
          "letterboxd_recent_profiles",
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

  const pattern = useMemo(
    () => BENTO_PATTERNS[Math.floor(Math.random() * BENTO_PATTERNS.length)],
    [],
  )

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
        <div
          style={{
            margin: "24px 40px",
            padding: "14px 20px",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: "3px",
            background: "rgba(255,80,80,0.05)",
            color: "rgba(255,80,80,0.8)",
            fontSize: "0.7rem",
            letterSpacing: "1px",
          }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "48px 40px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.6rem",
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
          pattern={pattern}
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
