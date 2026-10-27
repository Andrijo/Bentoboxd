import { useState } from "react"
import ActorsGrid from "./ActorsGrid.jsx"
import ActorsSpectrum from "./ActorsSpectrum.jsx"
import ActorsConstellation from "./ActorsConstellation.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"

export default function ActorsPanel({ actors, loading }) {
  const [viewMode, setViewMode] = useState("grid")

  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const hasData = topActors.length > 0

  return (
    <section aria-labelledby="rd-panel-reparto" style={{
      gridArea: "actors", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.02)", overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <h2 id="rd-panel-reparto" className="rd-panel-title">
          TOP REPARTO
        </h2>

        {hasData && !loading && (
          <div role="group" className="rd-segmented" aria-label="Vista de reparto" style={{
            display: "flex", flexWrap: "wrap", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "var(--radius-md)", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "grid", label: "Grilla" },
              { key: "spectrum", label: "Espectro" },
              { key: "constellation", label: "Mapa" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                type="button"
                aria-pressed={viewMode === key}
                style={{
                  background: viewMode === key ? "rgba(255,255,255,0.08)" : "transparent",
                  border: viewMode === key
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid transparent",
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

      <div style={{ padding: "24px", minHeight: "200px" }}>
        {loading && <PanelSkeleton variant="rows" label="Explorando apariciones…" />}

        {!loading && hasData && (
          <>
            {viewMode === "grid" && <ActorsGrid actors={actors} />}
            {viewMode === "spectrum" && <ActorsSpectrum actors={actors} />}
            {viewMode === "constellation" && <ActorsConstellation actors={actors} />}
          </>
        )}

        {!loading && !hasData && (
          <div style={{
            textAlign: "center", fontSize: "var(--fs-xs)",
            color: "rgba(255,255,255,0.55)", marginTop: "20px",
            fontFamily: "var(--font-mono)",
          }}>
            Sin datos de reparto disponibles
          </div>
        )}
      </div>
    </section>
  )
}
