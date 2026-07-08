import { useState } from "react"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"
import DonutChart from "./DonutChart.jsx"
import RadarChart from "./RadarChart.jsx"
import BarChart from "./BarChart.jsx"
import MatrixChart from "./MatrixChart.jsx"
import GaugesChart from "./GaugesChart.jsx"

export default function GenrePanel({ genres, loadingGenres, genreError }) {
  const [chartType, setChartType] = useState("donut")

  const total = Object.values(genres || {}).reduce((a, b) => a + b, 0)
  const hasData = total > 0

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
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem",
            letterSpacing: "2px", color: "#F0EDE5", lineHeight: 1,
          }}>
            TOP GÉNEROS
          </div>
          {hasData && (
            <div style={{
              fontSize: "0.5rem", color: "rgba(255,255,255,0.25)",
              letterSpacing: "2px", marginTop: "4px",
              fontFamily: "'Space Mono', monospace", textTransform: "uppercase",
            }}>
              Clasificado por TMDB — {total} películas consumidas
            </div>
          )}
        </div>

        {hasData && (
          <div style={{
            display: "flex", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "3px", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "donut", label: "◉ Pastel" },
              { key: "radar", label: "⬡ Radar" },
              { key: "bar", label: "⬡ Barras" },
              { key: "matrix", label: "⬡ Matriz" },
              { key: "gauges", label: "⬡ Hub" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                type="button"
                style={{
                  background: chartType === key ? "rgba(0,229,255,0.15)" : "transparent",
                  border: chartType === key
                    ? "1px solid rgba(0,229,255,0.35)"
                    : "1px solid transparent",
                  color: chartType === key ? "#00e5ff" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px", borderRadius: "2px", cursor: "pointer",
                  fontSize: "0.75rem", fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1.5px", transition: "background 0.2s, border-color 0.2s, color 0.2s",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{
        padding: "32px 24px", minHeight: "200px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {loadingGenres && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
            <div style={{
              fontSize: "0.55rem", letterSpacing: "4px", color: "rgba(0,229,255,0.5)",
              animation: "pulse 1.2s ease infinite", fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
            }}>
              ◈ Clasificando géneros con TMDB...
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {GENRE_KEYS.slice(0, 5).map((k) => (
                <div key={k} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: GENRE_CONFIG[k].color,
                  animation: "pulse 1.2s ease infinite",
                  animationDelay: `${GENRE_KEYS.indexOf(k) * 100}ms`, opacity: 0.6,
                }} />
              ))}
            </div>
          </div>
        )}

        {genreError && !loadingGenres && (
          <div style={{
            fontSize: "0.6rem", color: "rgba(255,80,80,0.7)",
            letterSpacing: "1px", fontFamily: "'Space Mono', monospace",
            textAlign: "center",
          }}>
            ⚠ {genreError}
          </div>
        )}

        {!loadingGenres && !genreError && hasData && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            {chartType === "donut" && <DonutChart genres={genres} />}
            {chartType === "radar" && <RadarChart genres={genres} />}
            {chartType === "bar" && <BarChart genres={genres} />}
            {chartType === "matrix" && <MatrixChart genres={genres} />}
            {chartType === "gauges" && <GaugesChart genres={genres} />}
          </div>
        )}

        {!loadingGenres && !genreError && !hasData && (
          <div style={{
            fontSize: "0.75rem", color: "rgba(255,255,255,0.2)",
            letterSpacing: "2px", fontFamily: "'Space Mono', monospace",
          }}>
            Sin datos de géneros disponibles
          </div>
        )}
      </div>
    </div>
  )
}
