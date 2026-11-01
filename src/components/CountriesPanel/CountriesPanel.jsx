import { useState } from "react"
import CountryDatalog from "./CountryDatalog.jsx"
import CountrySectors from "./CountrySectors.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"
import { useMessages } from "../../i18n/index.js"

const VIEW_KEYS = ["list", "nodes"]

export default function CountriesPanel({ countries, movies, loading }) {
  const t = useMessages()
  const [viewMode, setViewMode] = useState("list")

  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const hasData = topCountryCodes.length > 0

  return (
    <Panel
      id="rd-panel-paises"
      area="countries"
      title={t.countriesPanel.title}
      actions={hasData && !loading && (
        <SegmentedControl
          label={t.countriesPanel.viewLabel}
          options={VIEW_KEYS.map((key) => ({ key, label: t.countriesPanel.views[key] }))}
          value={viewMode}
          onChange={setViewMode}
        />
      )}
      bodyStyle={{ minHeight: "150px" }}>
      {loading && <PanelSkeleton variant="rows" label={t.countriesPanel.loading} />}

      {!loading && hasData && (
        <>
          {viewMode === "list" && <CountryDatalog countries={countries} movies={movies} />}
          {viewMode === "nodes" && <CountrySectors countries={countries} />}
        </>
      )}
      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "var(--c-text-muted)", marginTop: "20px",
          fontFamily: "var(--font-mono)",
        }}>
          {t.countriesPanel.empty}
        </div>
      )}
    </Panel>
  )
}
