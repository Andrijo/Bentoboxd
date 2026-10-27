import { useState } from "react"
import CountryDatalog from "./CountryDatalog.jsx"
import CountrySectors from "./CountrySectors.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"

const VIEW_OPTIONS = [
  { key: "list", label: "Lista" },
  { key: "nodes", label: "Sectores" },
]

export default function CountriesPanel({ countries, loading }) {
  const [viewMode, setViewMode] = useState("list")

  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const hasData = topCountryCodes.length > 0

  return (
    <Panel
      id="rd-panel-paises"
      area="countries"
      title="TOP PAÍSES"
      actions={hasData && !loading && (
        <SegmentedControl label="Vista de países" options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
      )}
      bodyStyle={{ minHeight: "150px" }}>
      {loading && <PanelSkeleton variant="rows" label="Rastreando países…" />}
      {!loading && hasData && (
        <>
          {viewMode === "list" && <CountryDatalog countries={countries} />}
          {viewMode === "nodes" && <CountrySectors countries={countries} />}
        </>
      )}
      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "rgba(255,255,255,0.55)", marginTop: "20px",
          fontFamily: "var(--font-mono)",
        }}>
          Sin datos de origen disponibles
        </div>
      )}
    </Panel>
  )
}
