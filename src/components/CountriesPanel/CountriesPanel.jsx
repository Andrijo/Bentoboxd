import { useState } from "react"
import CountryDatalog from "./CountryDatalog.jsx"
import CountrySectors from "./CountrySectors.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"

export default function CountriesPanel({ countries, loading }) {
  const [viewMode, setViewMode] = useState("list")

  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const hasData = topCountryCodes.length > 0

  return (
    <section aria-labelledby="rd-panel-paises" style={{
      gridArea: "countries", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.02)", overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <h2 id="rd-panel-paises" className="rd-panel-title">
          TOP PAÍSES
        </h2>
        {hasData && !loading && (
          <div role="group" className="rd-segmented" aria-label="Vista de países" style={{
            display: "flex", flexWrap: "wrap", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "var(--radius-md)", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "list", label: "Lista" },
              { key: "nodes", label: "Sectores" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                type="button"
                aria-pressed={viewMode === key}
                style={{
                  background: viewMode === key ? "rgba(255,255,255,0.08)" : "transparent",
                  border: viewMode === key ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                  color: viewMode === key ? "#F0EDE5" : "rgba(255,255,255,0.55)",
                  padding: "5px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                  fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
                  letterSpacing: "1.5px", transition: "background 0.2s, border-color 0.2s, color 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "24px", minHeight: "150px" }}>
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
      </div>
    </section>
  )
}
