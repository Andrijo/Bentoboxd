import { useState } from "react"
import { PanelSkeleton } from "../Skeleton.jsx"

export default function PlatformsPanel({ platformsData, movies, loading }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const { counts, logos } = platformsData || { counts: {}, logos: {} }

  const topPlatforms = Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const filteredMovies = movies.filter(m => m.platforms?.includes(selectedPlatform))

  return (
    <section aria-labelledby="rd-panel-streaming" style={{
      margin: "0 var(--gutter) 40px", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.02)",
      overflow: "hidden", fontFamily: "var(--font-mono)",
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h2 id="rd-panel-streaming" className="rd-panel-title">
          STREAMING
        </h2>
        {selectedPlatform && (
          <button onClick={() => setSelectedPlatform(null)} type="button" style={{
            background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#DBD5CA",
            fontSize: "var(--fs-xs)", padding: "4px 10px", cursor: "pointer",
          }}>
            <span aria-hidden="true">✕</span> Quitar filtro
          </button>
        )}
      </div>

      <div style={{ padding: "24px" }}>
        {loading ? (
          <PanelSkeleton variant="tiles" label="Buscando plataformas…" />
        ) : (
          <>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px", marginBottom: selectedPlatform ? "24px" : "0",
            }}>
              {topPlatforms.map(([name, count]) => (
                <button key={name}
                  type="button"
                  aria-pressed={selectedPlatform === name}
                  onClick={() => setSelectedPlatform(name)}
                  style={{
                    font: "inherit", color: "inherit", textAlign: "left",
                    display: "flex", alignItems: "center", gap: "12px",
                    background: selectedPlatform === name ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.4)",
                    padding: "10px", borderRadius: "var(--radius-md)",
                    border: `1px solid ${selectedPlatform === name ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.05)"}`,
                    cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
                  }}>
                  <img src={logos[name]} alt=""
                    loading="lazy" decoding="async"
                    style={{ width: "30px", height: "30px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "var(--fs-xs)", color: "#DBD5CA", fontWeight: "bold", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.5)" }}>{count} items</div>
                  </div>
                </button>
              ))}
            </div>

            {selectedPlatform && (
              <div role="region" aria-label={`Películas en ${selectedPlatform}`} style={{
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
                padding: "16px", borderRadius: "var(--radius-md)", animation: "fadeSlideIn 0.3s ease both",
              }}>
                <div style={{
                  fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.5)", letterSpacing: "2px",
                  marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px",
                }}>
                  Mostrando archivos en: {selectedPlatform}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {filteredMovies.map((m) => (
                    <div key={m.link} style={{
                      fontSize: "var(--fs-xs)", color: "#F0EDE5",
                      display: "flex", justifyContent: "space-between",
                    }}>
                      <span><span aria-hidden="true">&gt; </span>{m.title}</span>
                      <span style={{ color: "rgba(255,255,255,0.55)" }}>{m.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
