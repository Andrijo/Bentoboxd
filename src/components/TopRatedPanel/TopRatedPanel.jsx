import { useMemo } from "react"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import PersonAvatar from "../PersonAvatar.jsx"
import { computeTopRated } from "../../utils/topRated.js"
import { OTHER_GENRE } from "../../constants/genres.js"
import { useMessages } from "../../i18n/index.js"

const formatAverage = (value) => value.toFixed(1)

function RankedList({ title, items, photos }) {
  const t = useMessages()

  return (
    <section aria-label={title}>
      <h3 style={{
        fontWeight: "inherit", fontSize: "var(--fs-xs)", letterSpacing: "2px",
        color: "var(--c-text-muted)", marginBottom: "12px",
      }}>
        {title}
      </h3>
      <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map(({ name, average, count }, i) => (
          <li key={name} style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "8px 14px",
            border: "1px solid rgb(var(--fg-rgb) / 0.05)", borderRadius: "var(--radius-md)",
            background: "var(--c-inset)",
          }}>
            {photos ? (
              <PersonAvatar name={name} photo={photos[name]} rank={i + 1} compact />
            ) : (
              <span aria-hidden="true" style={{
                fontFamily: "var(--font-display)", fontSize: "var(--fs-md)",
                color: "rgb(var(--fg-rgb) / 0.3)", width: "20px",
              }}>
                {i + 1}
              </span>
            )}
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "block", fontSize: "var(--fs-sm)", color: "var(--c-text)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {name}
              </span>
              <span style={{
                display: "block", marginTop: "2px", fontSize: "var(--fs-xs)",
                color: "var(--c-text-muted)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {t.topRatedPanel.ratedMovies(count)}
              </span>
            </span>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)",
              color: "var(--c-text-bright)", flexShrink: 0,
            }}>
              {formatAverage(average)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function TopRatedPanel({ movies, photos = {}, loading }) {
  const t = useMessages()
  const genres = useMemo(
    () => computeTopRated(movies, "genres", { exclude: [OTHER_GENRE], limit: 3 }),
    [movies],
  )
  const directors = useMemo(
    () => computeTopRated(movies, "directors", { limit: 3 }),
    [movies],
  )
  const hasData = genres.length + directors.length > 0

  return (
    <Panel
      id="rd-panel-mejor-calificados"
      area="toprated"
      title={t.topRatedPanel.title}
      subtitle={!loading && hasData && t.topRatedPanel.subtitle}>
      {loading && <PanelSkeleton variant="rows" label={t.topRatedPanel.loading} />}

      {!loading && hasData && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px",
        }}>
          {genres.length > 0 && <RankedList
              title={t.common.genres}
              items={genres.map((item) => ({ ...item, name: t.genres[item.name] }))}
            />}
          {directors.length > 0 && <RankedList title={t.common.directors} items={directors} photos={photos} />}
        </div>
      )}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          marginTop: "20px", fontFamily: "var(--font-mono)",
        }}>
          {t.topRatedPanel.empty}
        </div>
      )}
    </Panel>
  )
}
