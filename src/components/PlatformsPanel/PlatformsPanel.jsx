import { useState } from "react"

const themeColor = "#e81cff"

export default function PlatformsPanel({ platformsData, movies, loading }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const { counts, logos } = platformsData || { counts: {}, logos: {} }

  const topPlatforms = Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const filteredMovies = movies.filter(m => m.platforms?.includes(selectedPlatform))

  return (
    <div style={{
      margin: "0 40px 40px", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "4px", background: "rgba(255,255,255,0.02)",
      overflow: "hidden", fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "2px", color: "#F0EDE5" }}>
          STREAMING
        </div>
        {selectedPlatform && (
          <button onClick={() => setSelectedPlatform(null)} type="button" style={{
            background: "none", border: `1px solid ${themeColor}`, color: themeColor,
            fontSize: "0.75rem", padding: "4px 10px", cursor: "pointer", textTransform: "uppercase",
          }}>
            ✕ Desvincular
          </button>
        )}
      </div>

      <div style={{ padding: "24px" }}>
        {loading ? (
          <div style={{
            textAlign: "center", fontSize: "0.75rem", letterSpacing: "4px",
            color: themeColor, animation: "pulse 1.2s ease infinite",
          }}>
            ◈ ESCANEANDO FRECUENCIAS...
          </div>
        ) : (
          <>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px", marginBottom: selectedPlatform ? "24px" : "0",
            }}>
              {topPlatforms.map(([name, count]) => (
                <div key={name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPlatform(name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedPlatform(name)
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: selectedPlatform === name ? `${themeColor}15` : "rgba(0,0,0,0.4)",
                    padding: "10px", borderRadius: "4px",
                    border: `1px solid ${selectedPlatform === name ? themeColor : "rgba(255,255,255,0.05)"}`,
                    cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
                  }}>
                  <img src={logos[name]} alt={name}
                    style={{ width: "30px", height: "30px", borderRadius: "4px", border: `1px solid ${themeColor}30` }} />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "0.75rem", color: "#DBD5CA", fontWeight: "bold", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: themeColor }}>{count} ITEMS</div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPlatform && (
              <div style={{
                background: "rgba(0,0,0,0.3)", border: `1px solid ${themeColor}30`,
                padding: "16px", borderRadius: "4px", animation: "fadeSlideIn 0.3s ease both",
              }}>
                <div style={{
                  fontSize: "0.75rem", color: themeColor, letterSpacing: "2px",
                  marginBottom: "12px", borderBottom: `1px solid ${themeColor}20`, paddingBottom: "8px",
                }}>
                  MOSTRANDO ARCHIVOS EN: {selectedPlatform.toUpperCase()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {filteredMovies.map((m) => (
                    <div key={m.title} style={{
                      fontSize: "0.75rem", color: "#F0EDE5",
                      display: "flex", justifyContent: "space-between",
                    }}>
                      <span>&gt; {m.title}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>{m.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
