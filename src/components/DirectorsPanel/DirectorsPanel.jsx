import { useState } from "react"
import DirectorCards from "./DirectorCards.jsx"
import DirectorHologram from "./DirectorHologram.jsx"
import DirectorOrbit from "./DirectorOrbit.jsx"

export default function DirectorsPanel({ directors, loading }) {
  const [viewMode, setViewMode] = useState("cards")

  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const hasData = topDirectors.length > 0

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
          TOP DIRECTORES
        </div>

        {hasData && !loading && (
          <div style={{
            display: "flex", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "3px", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "cards", label: "≡ LISTA" },
              { key: "hologram", label: "◫ HOLOGRAMA" },
              { key: "orbit", label: "◎ ÓRBITA" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  background: viewMode === key ? "rgba(192,132,252,0.15)" : "transparent",
                  border: viewMode === key
                    ? "1px solid rgba(192,132,252,0.35)"
                    : "1px solid transparent",
                  color: viewMode === key ? "#c084fc" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px", borderRadius: "2px", cursor: "pointer",
                  fontSize: "0.75rem", fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px", transition: "all 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "24px", minHeight: "220px" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div style={{
              fontSize: "0.75rem", letterSpacing: "4px", color: "rgba(0,229,255,0.5)",
              animation: "pulse 1.2s ease infinite", fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
            }}>
              ◈ Analizando directores...
            </div>
          </div>
        )}

        {!loading && hasData && (
          <>
            {viewMode === "cards" && <DirectorCards directors={directors} />}
            {viewMode === "hologram" && <DirectorHologram directors={directors} />}
            {viewMode === "orbit" && <DirectorOrbit directors={directors} />}
          </>
        )}

        {!loading && !hasData && (
          <div style={{
            textAlign: "center", fontSize: "0.75rem",
            color: "rgba(255,255,255,0.2)", marginTop: "20px",
            fontFamily: "'Space Mono', monospace",
          }}>
            Sin datos de directores disponibles
          </div>
        )}
      </div>
    </div>
  )
}
