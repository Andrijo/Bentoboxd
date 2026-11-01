import { Fragment, useState } from "react"
import MovieDrilldown from "../MovieDrilldown.jsx"
import { formatMovieCount } from "../../utils/formatters.js"
import { moviesWith } from "../../utils/movieFilters.js"

export default function ActorsGrid({ actors, movies = [] }) {
  const [openActor, setOpenActor] = useState(null)
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px",
    }}>
      {topActors.map(([name, count], i) => {
        return (
          <Fragment key={name}>
            <button
              type="button"
              aria-expanded={openActor === name}
              onClick={() => setOpenActor((open) => (open === name ? null : name))}
              className="rd-drill-row"
              style={{
                display: "flex", alignItems: "center",
                background: "var(--c-inset-strong)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)", animation: "fadeSlideIn 0.3s ease both",
                animationDelay: `${i * 50}ms`,
              }}>
              <span className="rd-rank-circle">
                {i + 1}
              </span>
              <span style={{ flex: 1, overflow: "hidden" }}>
                <span style={{
                  display: "block", fontSize: "var(--fs-xs)", fontWeight: "bold",
                  color: "var(--c-text)", whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {name}
                </span>
                <span style={{ display: "block", fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
                  {formatMovieCount(count)}
                </span>
              </span>
            </button>
            {openActor === name && (
              <MovieDrilldown label={`Películas con ${name}`} movies={moviesWith(movies, "actors", name)} />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
