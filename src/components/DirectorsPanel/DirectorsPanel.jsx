import { useState } from "react"
import DirectorCards from "./DirectorCards.jsx"
import DirectorHologram from "./DirectorHologram.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"
import { topDirectors } from "../../utils/topDirectors.js"

const VIEW_OPTIONS = [
  { key: "cards", label: "Lista" },
  { key: "hologram", label: "Holograma" },
]

export default function DirectorsPanel({ directors, movies, photos, loading }) {
  const [viewMode, setViewMode] = useState("cards")

  const ranking = topDirectors(directors)
  const hasData = ranking.length > 0
  const hasDirectors = Object.keys(directors || {}).length > 0

  return (
    <Panel
      id="rd-panel-directores"
      area="directors"
      title="TOP DIRECTORES"
      subtitle={hasData && !loading && "Con al menos 2 películas"}
      actions={hasData && !loading && (
        <SegmentedControl label="Vista de directores" options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
      )}
      bodyStyle={{ minHeight: "220px" }}>
      {loading && <PanelSkeleton variant="rows" label="Analizando directores…" />}

      {!loading && hasData && (
        <>
          {viewMode === "cards" && <DirectorCards ranking={ranking} movies={movies} photos={photos} />}
          {viewMode === "hologram" && <DirectorHologram ranking={ranking} />}
        </>
      )}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "var(--c-text-muted)", marginTop: "20px",
          fontFamily: "var(--font-mono)",
        }}>
          {hasDirectors
            ? "Ningún director tiene al menos 2 películas en este perfil."
            : "Sin datos de directores disponibles"}
        </div>
      )}
    </Panel>
  )
}
