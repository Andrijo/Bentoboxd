import { useState } from "react"
import ActorsGrid from "./ActorsGrid.jsx"
import ActorsSpectrum from "./ActorsSpectrum.jsx"
import ActorsConstellation from "./ActorsConstellation.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"

const VIEW_OPTIONS = [
  { key: "grid", label: "Cuadrícula" },
  { key: "spectrum", label: "Espectro" },
  { key: "constellation", label: "Mapa" },
]

export default function ActorsPanel({ actors, movies, loading }) {
  const [viewMode, setViewMode] = useState("grid")

  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const hasData = topActors.length > 0

  return (
    <Panel
      id="rd-panel-reparto"
      area="actors"
      title="TOP REPARTO"
      actions={hasData && !loading && (
        <SegmentedControl label="Vista de reparto" options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
      )}
      bodyStyle={{ minHeight: "200px" }}>
      {loading && <PanelSkeleton variant="rows" label="Explorando apariciones…" />}

      {!loading && hasData && (
        <>
          {viewMode === "grid" && <ActorsGrid actors={actors} movies={movies} />}
          {viewMode === "spectrum" && <ActorsSpectrum actors={actors} />}
          {viewMode === "constellation" && <ActorsConstellation actors={actors} />}
        </>
      )}

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
