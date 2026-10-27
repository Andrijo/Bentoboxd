import { useState } from "react"
import DonutChart from "./DonutChart.jsx"
import RadarChart from "./RadarChart.jsx"
import BarChart from "./BarChart.jsx"
import MatrixChart from "./MatrixChart.jsx"
import GaugesChart from "./GaugesChart.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"

export default function GenrePanel({ genres, movieCount, loadingGenres, genreError }) {
  const [chartType, setChartType] = useState("donut")

  const total = Object.values(genres || {}).reduce((a, b) => a + b, 0)
  const hasData = total > 0

  return (
    <div style={{
      margin: "0 var(--gutter) 40px", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "4px", background: "rgba(255,255,255,0.02)", overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-2xl)",
            letterSpacing: "2px", color: "#F0EDE5", lineHeight: 1,
          }}>
            TOP GÉNEROS
          </div>
          {hasData && (
            <div style={{
              fontSize: "var(--fs-2xs)", color: "rgba(255,255,255,0.25)",
              letterSpacing: "2px", marginTop: "4px",
              fontFamily: "var(--font-mono)", textTransform: "uppercase",
            }}>
              Clasificado por TMDB — {movieCount ?? total} películas · {total} géneros
            </div>
          )}
        </div>

        {hasData && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "4px", background: "rgba(0,0,0,0.3)",
            borderRadius: "3px", padding: "3px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[
              { key: "donut", label: "PASTEL" },
              { key: "radar", label: "RADAR" },
              { key: "bar", label: "BARRAS" },
              { key: "matrix", label: "MATRIZ" },
              { key: "gauges", label: "HUB" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChartType(key)}
                type="button"
                style={{
                  background: chartType === key ? "rgba(255,255,255,0.08)" : "transparent",
                  border: chartType === key
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid transparent",
                  color: chartType === key ? "#F0EDE5" : "rgba(255,255,255,0.3)",
                  padding: "5px 12px", borderRadius: "2px", cursor: "pointer",
                  fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
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
        {loadingGenres && <PanelSkeleton variant="chart" label="Clasificando géneros…" />}

        {genreError && !loadingGenres && (
          <div style={{
            fontSize: "var(--fs-2xs)", color: "rgba(255,80,80,0.7)",
            letterSpacing: "1px", fontFamily: "var(--font-mono)",
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
            fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.2)",
            letterSpacing: "2px", fontFamily: "var(--font-mono)",
          }}>
            Sin datos de géneros disponibles
          </div>
        )}
      </div>
    </div>
  )
}
