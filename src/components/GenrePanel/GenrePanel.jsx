import { useState } from "react"
import DonutChart from "./DonutChart.jsx"
import RadarChart from "./RadarChart.jsx"
import BarChart from "./BarChart.jsx"
import MatrixChart from "./MatrixChart.jsx"
import GaugesChart from "./GaugesChart.jsx"
import GenreList from "./GenreList.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"
import { formatMovieCount } from "../../utils/formatters.js"

const CHART_OPTIONS = [
  { key: "donut", label: "Dona" },
  { key: "radar", label: "Radar" },
  { key: "bar", label: "Barras" },
  { key: "matrix", label: "Matriz" },
  { key: "gauges", label: "Medidores" },
]

export default function GenrePanel({ genres, movieCount, loadingGenres }) {
  const [chartType, setChartType] = useState("donut")

  const total = Object.values(genres || {}).reduce((a, b) => a + b, 0)
  const hasData = total > 0
  // `total` suma etiquetas (una película tiene varias); aquí van los géneros distintos.
  const genreCount = Object.values(genres || {}).filter((n) => n > 0).length

  return (
    <Panel
      id="rd-panel-generos"
      area="genres"
      title="TOP GÉNEROS"
      subtitle={hasData && `${formatMovieCount(movieCount)} · ${genreCount} género${genreCount === 1 ? "" : "s"}`}
      actions={hasData && (
        <SegmentedControl label="Tipo de gráfico" options={CHART_OPTIONS} value={chartType} onChange={setChartType} />
      )}
      bodyStyle={{
        padding: "32px 24px", minHeight: "200px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "32px",
      }}>
      {loadingGenres && <PanelSkeleton variant="chart" label="Clasificando géneros…" />}

      {!loadingGenres && hasData && (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          {chartType === "donut" && <DonutChart genres={genres} movieCount={movieCount} />}
          {chartType === "radar" && <RadarChart genres={genres} />}
          {chartType === "bar" && <BarChart genres={genres} />}
          {chartType === "matrix" && <MatrixChart genres={genres} movieCount={movieCount} />}
          {chartType === "gauges" && <GaugesChart genres={genres} />}
        </div>
      )}

      {!loadingGenres && hasData && (
        <GenreList genres={genres} movieCount={movieCount} />
      )}

      {!loadingGenres && !hasData && (
        <div style={{
          fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          letterSpacing: "2px", fontFamily: "var(--font-mono)",
        }}>
          Sin datos de géneros disponibles
        </div>
      )}
    </Panel>
  )
}
