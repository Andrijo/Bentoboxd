import ActorsGrid from "./ActorsGrid.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"

export default function ActorsPanel({ actors, movies, photos, loading }) {
  const hasData = Object.keys(actors || {}).length > 0

  return (
    <Panel
      id="rd-panel-reparto"
      area="actors"
      title="TOP REPARTO"
      bodyStyle={{ minHeight: "200px" }}>
      {loading && <PanelSkeleton variant="rows" label="Explorando apariciones…" />}

      {!loading && hasData && <ActorsGrid actors={actors} movies={movies} photos={photos} />}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "var(--c-text-muted)", marginTop: "20px",
          fontFamily: "var(--font-mono)",
        }}>
          Sin datos de reparto disponibles
        </div>
      )}
    </Panel>
  )
}
