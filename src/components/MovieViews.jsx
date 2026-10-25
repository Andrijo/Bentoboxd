import { useMemo } from "react"
import MovieCard from "./BentoGrid/MovieCard.jsx"
import StarRating from "./StarRating.jsx"
import PosterImage from "./PosterImage.jsx"
import { generateBentoLayout, VISIBLE_MOVIES } from "./BentoGrid/bentoPatterns.js"
import { useGridColumns } from "../hooks/useGridColumns.js"

const VIEW_OPTIONS = [
  { key: "bento", label: "▦ BENTO" },
  { key: "timeline", label: "▤ LÍNEA DE TIEMPO" },
  { key: "terminal", label: ">_ TERMINAL" },
]

export default function MovieViews({ movies: allMovies, movieViewMode, username, onViewModeChange }) {
  const movies = allMovies.slice(0, VISIBLE_MOVIES)
  const [gridRef, columns] = useGridColumns()

  const bentoLayout = useMemo(
    () => generateBentoLayout(columns, movies.length),
    [columns, movies.length],
  )
  return (
    <div style={{ padding: "32px 40px 32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}>
        {username && (
          <div
            style={{
              fontSize: "var(--fs-2xs)",
              letterSpacing: "3px",
              color: "#fafafa",
              textTransform: "uppercase",
            }}>
            @{username} — {movies.length < allMovies.length
              ? `${movies.length} de ${allMovies.length}`
              : movies.length} películas recientes
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "3px",
            padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
          {VIEW_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onViewModeChange(key)}
              type="button"
              aria-pressed={movieViewMode === key}
              style={{
                background:
                  movieViewMode === key
                    ? "rgba(0,229,255,0.15)"
                    : "transparent",
                border:
                  movieViewMode === key
                    ? "1px solid rgba(0,229,255,0.35)"
                    : "1px solid transparent",
                color:
                  movieViewMode === key
                    ? "#00e5ff"
                    : "rgba(255,255,255,0.3)",
                padding: "5px 12px",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "var(--fs-xs)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "1.5px",
                transition: "background 0.2s, border-color 0.2s, color 0.2s",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {movieViewMode === "bento" && (
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${bentoLayout.columns}, 1fr)`,
            gridAutoRows: "180px",
            gap: "8px",
          }}>
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.link}
              movie={movie}
              size={bentoLayout.sizes[i] || 1}
              index={i}
            />
          ))}
        </div>
      )}

      {movieViewMode === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {movies.map((movie, i) => (
            <a
              href={movie.link}
              target="_blank"
              rel="noopener noreferrer"
              key={movie.link}
              className="rd-timeline-row"
              style={{
                textDecoration: "none",
                color: "inherit",
                animation: "fadeSlideIn 0.4s ease both",
                animationDelay: `${i * 40}ms`,
              }}
>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-2xl)",
                  color: "rgba(255,255,255,0.1)",
                  width: "40px",
                  textAlign: "center",
                }}>
                {String(i + 1).padStart(2, "0")}
              </div>

              <div
                style={{
                  position: "relative",
                  width: "50px",
                  height: "75px",
                  flexShrink: 0,
                  background: "#111",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}>
                {movie.poster ? (
                  <PosterImage
                    src={movie.poster}
                    alt={movie.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--fs-lg)",
                    }}>
                    🎬
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--fs-xl)",
                    color: "#F0EDE5",
                    letterSpacing: "1px",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                  {movie.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {movie.year && (
                    <span
                      style={{
                        fontSize: "var(--fs-xs)",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "var(--font-mono)",
                      }}>
                      AÑO: {movie.year}
                    </span>
                  )}
                  <StarRating rating={movie.rating} />
                </div>
              </div>

              <div
                style={{
                  color: "#00e5ff",
                  fontSize: "var(--fs-md)",
                  padding: "0 10px",
                  opacity: 0.5,
                }}>
                ↗
              </div>
            </a>
          ))}
        </div>
      )}

      {movieViewMode === "terminal" && (
        <div className="rd-terminal-box">
          <div className="rd-terminal-overlay" />

          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "var(--fs-2xs)",
              marginBottom: "16px",
              textTransform: "uppercase",
            }}>
            root@sys:~# ./fetch_logs.sh --user={username} --limit={movies.length}
            <br />
            [OK] CONNECTED TO LETTERBOXD MAINFRAME...
            <br />
            [OK] DOWNLOADING SECURE LOGS...
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {movies.map((movie, i) => (
              <div
                key={movie.link}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px dashed rgba(0,229,255,0.15)",
                  fontSize: "var(--fs-xs)",
                  color: "#00e5ff",
                  animation: "fadeSlideIn 0.1s ease both",
                  animationDelay: `${i * 20}ms`,
                }}>
                <span style={{ display: "flex", gap: "12px", overflow: "hidden", whiteSpace: "nowrap" }}>
                  <span style={{ color: "#facc15" }}>
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", color: "#DBD5CA" }}>
                    {movie.title}
                  </span>
                </span>
                <span style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>
                    {movie.year || "----"}
                  </span>
                  <span style={{ color: "#4ade80", width: "40px", textAlign: "right" }}>
                    {movie.rating ? `${movie.rating}★` : "NULL"}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ color: "#00e5ff", marginTop: "12px", animation: "pulse 1s infinite" }}>
            _
          </div>
        </div>
      )}
    </div>
  )
}
