import { useState } from "react"
import MovieDrilldown from "../MovieDrilldown.jsx"
import PersonAvatar from "../PersonAvatar.jsx"
import { formatMovieCount } from "../../utils/formatters.js"
import { moviesWith } from "../../utils/movieFilters.js"

export default function DirectorCards({ ranking, movies = [], photos = {} }) {
  const [openDirector, setOpenDirector] = useState(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {ranking.map(([name, count], i) => (
        <div key={name} style={{
          animation: "fadeSlideIn 0.4s ease both", animationDelay: `${i * 100}ms`,
        }}>
          <button
            type="button"
            aria-expanded={openDirector === name}
            onClick={() => setOpenDirector((open) => (open === name ? null : name))}
            className="rd-drill-row"
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              background: "var(--c-inset)", padding: "12px 20px",
              borderRadius: "var(--radius-md)",
            }}>
            <PersonAvatar name={name} photo={photos[name]} rank={i + 1} />
            <span className="rd-director-text">
              <span style={{
                flex: 1, minWidth: 0, color: "var(--c-text)", fontSize: "var(--fs-sm)",
                letterSpacing: "1px", overflowWrap: "anywhere",
              }}>
                {name}
              </span>
              <span style={{
                fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
                fontFamily: "var(--font-mono)", letterSpacing: "1px",
                background: "rgb(var(--fg-rgb) / 0.05)",
                padding: "4px 8px", borderRadius: "var(--radius-sm)",
                whiteSpace: "nowrap",
              }}>
                {formatMovieCount(count)}
              </span>
            </span>
          </button>
          {openDirector === name && (
            <MovieDrilldown label={`Películas de ${name}`} movies={moviesWith(movies, "directors", name)} />
          )}
        </div>
      ))}
    </div>
  )
}
