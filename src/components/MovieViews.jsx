import { useMemo, useRef, useState } from "react"
import MovieCard from "./BentoGrid/MovieCard.jsx"
import MovieFilters from "./MovieFilters.jsx"
import SegmentedControl from "./Panel/SegmentedControl.jsx"
import StarRating from "./StarRating.jsx"
import PosterImage from "./PosterImage.jsx"
import { generateBentoLayout, VISIBLE_MOVIES } from "./BentoGrid/bentoPatterns.js"
import { useGridColumns, rowHeight } from "../hooks/useGridColumns.js"
import { formatWatchedDate } from "../utils/formatters.js"
import { NO_FILTERS, filterMovies } from "../utils/movieFilters.js"

const VIEW_OPTIONS = [
  { key: "bento", label: "Bento" },
  { key: "timeline", label: "Línea de tiempo" },
  { key: "terminal", label: "Terminal" },
]

// Con la lista completa, el retraso de las últimas filas no debe sentirse.
const staggerIndex = (index) => Math.min(index, VISIBLE_MOVIES)

export default function MovieViews({ movies: allMovies, movieViewMode, username, onViewModeChange }) {
  const [showAll, setShowAll] = useState(false)
  const [filters, setFilters] = useState(NO_FILTERS)
  const listTopRef = useRef(null)
  const canShowAll = allMovies.length > VISIBLE_MOVIES
  const movies = showAll ? filterMovies(allMovies, filters) : allMovies.slice(0, VISIBLE_MOVIES)
  const [gridRef, columns, compact] = useGridColumns()

  const showRecent = () => {
    setShowAll(false)
    setFilters(NO_FILTERS)
    listTopRef.current?.scrollIntoView()
  }

  const bentoLayout = useMemo(
    () => generateBentoLayout(columns, movies.length, { compact }),
    [columns, movies.length, compact],
  )
  return (
    <div style={{ padding: "32px var(--gutter)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}>
        <div
          ref={listTopRef}
          id="rd-section-peliculas"
          className="rd-section-anchor"
          aria-live="polite"
          style={{
            fontSize: "var(--fs-2xs)",
            letterSpacing: "3px",
            color: "var(--c-text-bright)",
          }}>
          {showAll
            ? `${movies.length} de ${allMovies.length} películas`
            : `${movies.length < allMovies.length
              ? `${movies.length} de ${allMovies.length}`
              : movies.length} películas recientes`}
        </div>

        <SegmentedControl
          label="Vista de películas"
          options={VIEW_OPTIONS}
          value={movieViewMode}
          onChange={onViewModeChange}
        />
      </div>

      {showAll && <MovieFilters movies={allMovies} filters={filters} onChange={setFilters} />}

      {movies.length === 0 && (
        <p className="rd-movies-empty">Ninguna película coincide con estos filtros.</p>
      )}

      {movieViewMode === "bento" && movies.length > 0 && (
        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${bentoLayout.columns}, 1fr)`,
            gridAutoRows: rowHeight(compact),
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

      {movieViewMode === "timeline" && movies.length > 0 && (
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
                animationDelay: `${staggerIndex(i) * 40}ms`,
              }}
>
              <div
                aria-hidden="true"
                className="rd-timeline-index"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-2xl)",
                  color: "rgb(var(--fg-rgb) / 0.1)",
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
                  background: "var(--c-inset-strong)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                }}>
                {movie.poster ? (
                  <PosterImage
                    src={movie.poster}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
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

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.1rem, 4vw, 1.8rem)",
                    color: "var(--c-text-bright)",
                    letterSpacing: "1px",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                  {movie.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  {movie.year && (
                    <span
                      style={{
                        fontSize: "var(--fs-xs)",
                        color: "var(--c-text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}>
                      {movie.year}
                    </span>
                  )}
                  <StarRating rating={movie.rating} />
                  {movie.liked && (
                    <span role="img" aria-label="Me gusta" style={{ color: "var(--c-text-bright)", fontSize: "var(--fs-xs)" }}>
                      ♥
                    </span>
                  )}
                  {movie.rewatch && (
                    <span style={{
                      fontSize: "var(--fs-2xs)", letterSpacing: "1px",
                      color: "var(--c-text-muted)", border: "1px solid rgb(var(--fg-rgb) / 0.2)",
                      borderRadius: "var(--radius-sm)", padding: "1px 6px",
                    }}>
                      Vista otra vez
                    </span>
                  )}
                </div>
                {formatWatchedDate(movie.watchedDate) && (
                  <div style={{
                    marginTop: "4px", fontSize: "var(--fs-xs)",
                    color: "var(--c-text-muted)", fontFamily: "var(--font-mono)",
                  }}>
                    Vista el {formatWatchedDate(movie.watchedDate)}
                  </div>
                )}
              </div>

              <div
                aria-hidden="true"
                style={{
                  color: "var(--c-accent)",
                  fontSize: "var(--fs-md)",
                  padding: "0 10px",
                  opacity: 0.5,
                }}>
                ↗
              </div>
              <span className="rd-sr-only">(se abre en Letterboxd en una pestaña nueva)</span>
            </a>
          ))}
        </div>
      )}

      {movieViewMode === "terminal" && movies.length > 0 && (
        <div className="rd-terminal-box rd-keep-dark">
          <div className="rd-terminal-overlay" aria-hidden="true" />

          <div
            aria-hidden="true"
            style={{
              color: "var(--c-text-muted)",
              fontSize: "var(--fs-2xs)",
              marginBottom: "16px",
            }}>
            root@sys:~# ./fetch_logs.sh --user={username} --limit={movies.length}
            <br />
            [OK] Connected to Letterboxd mainframe...
            <br />
            [OK] Downloading secure logs...
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {movies.map((movie, i) => (
              <a
                key={movie.link}
                href={movie.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rd-terminal-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  padding: "6px 0",
                  borderBottom: "1px dashed rgb(var(--fg-rgb) / 0.15)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--c-accent)",
                  animation: "fadeSlideIn 0.1s ease both",
                  animationDelay: `${staggerIndex(i) * 20}ms`,
                }}>
                <span style={{ display: "flex", gap: "12px", overflow: "hidden", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--c-text-muted)" }}>
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <span style={{ textOverflow: "ellipsis", overflow: "hidden", color: "var(--c-text)" }}>
                    {movie.title}
                  </span>
                </span>
                <span style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
                  <span style={{ color: "var(--c-text-muted)" }}>
                    {movie.year || "----"}
                  </span>
                  <span style={{ color: "var(--c-text-bright)", width: "40px", textAlign: "right" }}>
                    {movie.rating ? (
                      <span role="img" aria-label={`${movie.rating} de 5 estrellas`}>{movie.rating}★</span>
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="rd-sr-only">Sin calificar</span>
                      </>
                    )}
                  </span>
                </span>
                <span className="rd-sr-only">(se abre en Letterboxd en una pestaña nueva)</span>
              </a>
            ))}
          </div>
          <div aria-hidden="true" style={{ color: "var(--c-accent)", marginTop: "12px", animation: "pulse 1s infinite" }}>
            _
          </div>
        </div>
      )}

      {canShowAll && (
        <div className="rd-movies-more">
          <button
            type="button"
            className="rd-btn-outline"
            onClick={showAll ? showRecent : () => setShowAll(true)}>
            {showAll ? "Ver solo las recientes" : `Ver todas (${allMovies.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
