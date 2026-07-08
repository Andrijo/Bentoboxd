import { useState } from "react"
import CountryDatalog from "./CountryDatalog.jsx"
import CountrySectors from "./CountrySectors.jsx"

const themeColor = "#ff8c00"

export default function CountriesPanel({ countries, loading }) {
  const [viewMode, setViewMode] = useState("list")

  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const hasData = topCountryCodes.length > 0

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
          TOP PAÍSES
        </div>
        {hasData && !loading && (
          <div style={{
            display: "flex", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "3px", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "list", label: "≡ DATALOG" },
              { key: "nodes", label: "◰ SECTORES" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                style={{
                  background: viewMode === key ? `${themeColor}20` : "transparent",
                  border: viewMode === key ? `1px solid ${themeColor}50` : "1px solid transparent",
                  color: viewMode === key ? themeColor : "rgba(255,255,255,0.3)",
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
      <div style={{ padding: "24px", minHeight: "150px" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <div style={{
              fontSize: "0.75rem", letterSpacing: "4px", color: `${themeColor}80`,
              animation: "pulse 1.2s ease infinite", fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
            }}>
              ◈ Rastreando señales satelitales...
            </div>
          </div>
        )}
        {!loading && hasData && (
          <>
            {viewMode === "list" && <CountryDatalog countries={countries} />}
            {viewMode === "nodes" && <CountrySectors countries={countries} />}
          </>
        )}
        {!loading && !hasData && (
          <div style={{
            textAlign: "center", fontSize: "0.75rem",
            color: "rgba(255,255,255,0.2)", marginTop: "20px",
            fontFamily: "'Space Mono', monospace",
          }}>
            Sin datos de origen disponibles
          </div>
        )}
      </div>
    </div>
  )
}
