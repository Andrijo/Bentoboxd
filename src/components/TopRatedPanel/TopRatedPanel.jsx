import { useMemo } from "react"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import { computeTopRated } from "../../utils/topRated.js"
import { formatMovieCount } from "../../utils/formatters.js"

const formatAverage = (value) => value.toFixed(1)

function RankedList({ title, items }) {
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
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)",
            background: "var(--c-inset)",
          }}>
            <span aria-hidden="true" style={{
              fontFamily: "var(--font-display)", fontSize: "var(--fs-md)",
              color: "rgba(255,255,255,0.3)", width: "20px",
            }}>
              {i + 1}
            </span>
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
              }}>
                {formatMovieCount(count)} calificadas
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

export default function TopRatedPanel({ movies, loading }) {
  const genres = useMemo(
    () => computeTopRated(movies, "genres", { exclude: ["Otro"], limit: 3 }),
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
      title="MEJOR CALIFICADOS POR TI"
      subtitle={!loading && hasData && "Promedio de tus calificaciones, con al menos 2 películas"}>
      {loading && <PanelSkeleton variant="rows" label="Calculando tus favoritos…" />}

      {!loading && hasData && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px",
        }}>
          {genres.length > 0 && <RankedList title="Géneros" items={genres} />}
          {directors.length > 0 && <RankedList title="Directores" items={directors} />}
        </div>
      )}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          marginTop: "20px", fontFamily: "var(--font-mono)",
        }}>
          Aún no hay un género o director con al menos 2 películas calificadas por ti
        </div>
      )}
    </Panel>
  )
}
