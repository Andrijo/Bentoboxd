import { useState } from "react"
import ActorsGrid from "./ActorsGrid.jsx"
import ActorsSpectrum from "./ActorsSpectrum.jsx"
import ActorsConstellation from "./ActorsConstellation.jsx"

export default function ActorsPanel({ actors, loading }) {
  const [viewMode, setViewMode] = useState("grid")

  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const hasData = topActors.length > 0

  return (
    <div style={{
      margin: "0 40px 40px", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "4px", background: "rgba(255,255,255,0.02)", overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem",
          letterSpacing: "2px", color: "#F0EDE5", lineHeight: 1,
        }}>
          TOP REPARTO
        </div>

        {hasData && !loading && (
          <div style={{
            display: "flex", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "3px", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "grid", label: "▦ GRILLA" },
              { key: "spectrum", label: "▤ ESPECTRO" },
              { key: "constellation", label: "✨ MAPA" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  background: viewMode === key ? "rgba(74,222,128,0.15)" : "transparent",
                  border: viewMode === key
                    ? "1px solid rgba(74,222,128,0.35)"
                    : "1px solid transparent",
                  color: viewMode === key ? "#4ade80" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px", borderRadius: "2px", cursor: "pointer",
                  fontSize: "0.5rem", fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px", transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "24px", minHeight: "200px" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <div style={{
              fontSize: "0.55rem", letterSpacing: "4px", color: "rgba(74,222,128,0.5)",
              animation: "pulse 1.2s ease infinite", fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
            }}>
              Explorando apariciones...
            </div>
          </div>
        )}

        {!loading && hasData && (
          <>
            {viewMode === "grid" && <ActorsGrid actors={actors} />}
            {viewMode === "spectrum" && <ActorsSpectrum actors={actors} />}
            {viewMode === "constellation" && <ActorsConstellation actors={actors} />}
          </>
        )}

        {!loading && !hasData && (
          <div style={{
            textAlign: "center", fontSize: "0.55rem",
            color: "rgba(255,255,255,0.2)", marginTop: "20px",
            fontFamily: "'Space Mono', monospace",
          }}>
            Sin datos de reparto disponibles
          </div>
        )}
      </div>
    </div>
  )
}
