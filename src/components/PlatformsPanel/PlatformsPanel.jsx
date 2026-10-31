import { useState } from "react"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import MovieDrilldown from "../MovieDrilldown.jsx"
import { formatMovieCount } from "../../utils/formatters.js"
import { moviesWith } from "../../utils/movieFilters.js"

export default function PlatformsPanel({ platformsData, movies, loading }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const { counts, logos } = platformsData || { counts: {}, logos: {} }

  const topPlatforms = Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return (
    <Panel
      id="rd-panel-streaming"
      area="platforms"
      title="STREAMING"
      subtitle="Disponible por suscripción en México · Datos de JustWatch"
      actions={selectedPlatform && (
        <button onClick={() => setSelectedPlatform(null)} type="button" className="rd-btn-solid" style={{
          fontSize: "var(--fs-xs)", padding: "4px 10px", borderRadius: "var(--radius-sm)",
        }}>
          <span aria-hidden="true">✕</span> Quitar filtro
        </button>
      )}
      style={{ fontFamily: "var(--font-mono)" }}>
      {loading ? (
        <PanelSkeleton variant="tiles" label="Buscando plataformas…" />
      ) : topPlatforms.length === 0 ? (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)",
          color: "var(--c-text-muted)", fontFamily: "var(--font-mono)",
        }}>
          Ninguna de estas películas está en streaming por suscripción en México
        </div>
      ) : (
        <>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
          }}>
            {topPlatforms.map(([name, count]) => (
              <button key={name}
                type="button"
                aria-pressed={selectedPlatform === name}
                onClick={() => setSelectedPlatform((p) => (p === name ? null : name))}
                style={{
                  font: "inherit", color: "inherit", textAlign: "left",
                  display: "flex", alignItems: "center", gap: "12px",
                  background: selectedPlatform === name ? "rgb(var(--fg-rgb) / 0.06)" : "var(--c-inset-strong)",
                  padding: "10px", borderRadius: "var(--radius-md)",
                  border: `1px solid ${selectedPlatform === name ? "rgb(var(--fg-rgb) / 0.3)" : "rgb(var(--fg-rgb) / 0.05)"}`,
                  cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
                }}>
                <img src={logos[name]} alt=""
                  loading="lazy" decoding="async"
                  style={{ width: "30px", height: "30px", borderRadius: "var(--radius-sm)", border: "1px solid rgb(var(--fg-rgb) / 0.1)" }} />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text)", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {name}
                  </div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>{formatMovieCount(count)}</div>
                </div>
              </button>
            ))}
          </div>

          {selectedPlatform && (
            <MovieDrilldown
              label={`Películas en ${selectedPlatform}`}
              movies={moviesWith(movies, "platforms", selectedPlatform)}
            />
          )}
        </>
      )}
    </Panel>
  )
}
