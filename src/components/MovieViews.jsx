import { useRef, useState, useEffect, useMemo } from "react"
import MovieCard from "./BentoGrid/MovieCard.jsx"
import StarRating from "./StarRating.jsx"
import { generateGapFreePattern } from "./BentoGrid/bentoPatterns.js"

const VIEW_OPTIONS = [
  { key: "bento", label: "▦ BENTO" },
  { key: "timeline", label: "▤ LÍNEA DE TIEMPO" },
  { key: "terminal", label: ">_ TERMINAL" },
]

export default function MovieViews({ movies, movieViewMode, username, onViewModeChange }) {
  const gridRef = useRef(null)
  const [columns, setColumns] = useState(5)

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const measure = () => {
      const width = el.getBoundingClientRect().width
      if (width > 0) {
        setColumns(Math.max(2, Math.floor(width / 210)))
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [movies.length])

  const dynamicPattern = useMemo(
    () => generateGapFreePattern(columns, movies.length),
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
              fontSize: "0.6rem",
              letterSpacing: "3px",
              color: "#fafafa",
              textTransform: "uppercase",
            }}>
            @{username} — {movies.length} películas recientes
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
                fontSize: "0.75rem",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "1.5px",
                transition: "all 0.2s",
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
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: "180px",
            gap: "8px",
            gridAutoFlow: "dense",
          }}>
          {movies.map((movie, i) => (
            <MovieCard
              key={i}
              movie={movie}
              size={dynamicPattern[i] || 1}
              index={i}
            />
          ))}
        </div>
      )}

      {movieViewMode === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {movies.map((movie, i) => (
            <div
              key={i}
              className="rd-timeline-row"
              style={{
                animation: "fadeSlideIn 0.4s ease both",
                animationDelay: `${i * 40}ms`,
              }}
              onClick={() => window.open(movie.link, "_blank")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,229,255,0.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
              }>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "2rem",
                  color: "rgba(255,255,255,0.1)",
                  width: "40px",
                  textAlign: "center",
                }}>
                {String(i + 1).padStart(2, "0")}
              </div>

              <div
                style={{
                  width: "50px",
                  height: "75px",
                  flexShrink: 0,
                  background: "#111",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}>
                {movie.poster ? (
                  <img
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
                      fontSize: "1.5rem",
                    }}>
                    🎬
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.8rem",
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
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "'Space Mono', monospace",
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
                  fontSize: "1.2rem",
                  padding: "0 10px",
                  opacity: 0.5,
                }}>
                ↗
              </div>
            </div>
          ))}
        </div>
      )}

      {movieViewMode === "terminal" && (
        <div className="rd-terminal-box">
          <div className="rd-terminal-overlay" />

          <div
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.65rem",
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
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px dashed rgba(0,229,255,0.15)",
                  fontSize: "0.75rem",
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
