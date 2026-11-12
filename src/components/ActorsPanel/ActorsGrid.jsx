import { Fragment, useState } from "react"
import MovieDrilldown from "../MovieDrilldown.jsx"
import PersonAvatar from "../PersonAvatar.jsx"
import { formatMovieCount } from "../../utils/formatters.js"
import { moviesWith } from "../../utils/movieFilters.js"
import { useMessages } from "../../i18n/index.js"
import { staggerDelay } from "../../utils/stagger.js"

export default function ActorsGrid({ actors, movies = [], photos = {} }) {
  const t = useMessages()
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
                animationDelay: staggerDelay(i, 50),
              }}>
              <PersonAvatar name={name} photo={photos[name]} rank={i + 1} />
              <span style={{ flex: 1, overflow: "hidden", marginLeft: "12px" }}>
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
              <MovieDrilldown label={t.common.moviesWith(name)} movies={moviesWith(movies, "actors", name)} />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
