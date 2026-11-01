import { useState } from "react"
import MovieDrilldown from "../MovieDrilldown.jsx"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"
import { formatPercent } from "../../utils/formatters.js"
import { moviesWith } from "../../utils/movieFilters.js"

export default function GenreList({ genres, movieCount, movies = [] }) {
  const [openGenre, setOpenGenre] = useState(null)
  const ranked = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )

  return (
    <ol aria-label="Géneros por frecuencia" style={{
      width: "100%", margin: 0, padding: 0, listStyle: "none",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      {ranked.map((k, i) => {
        const count = genres[k]
        const color = GENRE_CONFIG[k].color
        return (
          <li key={k} style={{
            animation: "fadeSlideIn 0.3s ease both", animationDelay: `${i * 40}ms`,
          }}>
            <button
              type="button"
              aria-expanded={openGenre === k}
              onClick={() => setOpenGenre((open) => (open === k ? null : k))}
              className="rd-drill-row"
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: "var(--c-inset-strong)",
                borderRadius: "var(--radius-md)", padding: "8px 14px",
              }}>
              <span aria-hidden="true" style={{
                width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                background: color,
              }} />
              <span style={{
                flex: 1, fontSize: "var(--fs-xs)", fontWeight: "bold", color: "var(--c-text)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {k}
              </span>
              <span style={{
                fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
                color: "var(--c-text-muted)",
              }}>
                {formatPercent(count, movieCount)}
              </span>
              <span style={{
                minWidth: "24px", textAlign: "right", fontSize: "var(--fs-sm)",
                fontFamily: "var(--font-display)", letterSpacing: "1px", color: "var(--c-text-bright)",
              }}>
                {count}
              </span>
            </button>
            {openGenre === k && (
              <MovieDrilldown label={`Películas de ${k}`} movies={moviesWith(movies, "genres", k)} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
