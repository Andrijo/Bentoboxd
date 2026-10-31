import { useState } from "react"
import DirectorCards from "./DirectorCards.jsx"
import DirectorHologram from "./DirectorHologram.jsx"
import DirectorOrbit from "./DirectorOrbit.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"

const VIEW_OPTIONS = [
  { key: "cards", label: "Lista" },
  { key: "hologram", label: "Holograma" },
  { key: "orbit", label: "Órbita" },
]

export default function DirectorsPanel({ directors, loading }) {
  const [viewMode, setViewMode] = useState("cards")

  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const hasData = topDirectors.length > 0

  return (
    <Panel
      id="rd-panel-directores"
      area="directors"
      title="TOP DIRECTORES"
      actions={hasData && !loading && (
        <SegmentedControl label="Vista de directores" options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
      )}
      bodyStyle={{ minHeight: "220px" }}>
      {loading && <PanelSkeleton variant="rows" label="Analizando directores…" />}

      {!loading && hasData && (
        <>
          {viewMode === "cards" && <DirectorCards directors={directors} />}
          {viewMode === "hologram" && <DirectorHologram directors={directors} />}
          {viewMode === "orbit" && <DirectorOrbit directors={directors} />}
        </>
      )}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "var(--c-text-muted)", marginTop: "20px",
          fontFamily: "var(--font-mono)",
        }}>
          Sin datos de directores disponibles
        </div>
      )}
    </Panel>
  )
}
