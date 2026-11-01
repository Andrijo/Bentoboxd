import { useState } from "react"
import DonutChart from "./DonutChart.jsx"
import BarChart from "./BarChart.jsx"
import MatrixChart from "./MatrixChart.jsx"
import GaugesChart from "./GaugesChart.jsx"
import GenreList from "./GenreList.jsx"
import { PanelSkeleton } from "../Skeleton.jsx"
import Panel from "../Panel/Panel.jsx"
import SegmentedControl from "../Panel/SegmentedControl.jsx"
import { useMessages } from "../../i18n/index.js"

const CHART_KEYS = ["donut", "bar", "matrix", "gauges"]

export default function GenrePanel({ genres, movieCount, movies, loadingGenres }) {
  const t = useMessages()
  const [chartType, setChartType] = useState("donut")

  const total = Object.values(genres || {}).reduce((a, b) => a + b, 0)
  const hasData = total > 0
  // `total` suma etiquetas (una película tiene varias); aquí van los géneros distintos.
  const genreCount = Object.values(genres || {}).filter((n) => n > 0).length

  return (
    <Panel
      id="rd-panel-generos"
      area="genres"
      title={t.genrePanel.title}
      subtitle={hasData && t.genrePanel.subtitle(movieCount, genreCount)}
      actions={hasData && (
        <SegmentedControl
          label={t.genrePanel.chartType}
          options={CHART_KEYS.map((key) => ({ key, label: t.genrePanel.charts[key] }))}
          value={chartType}
          onChange={setChartType}
        />
      )}
      bodyStyle={{
        padding: "32px 24px", minHeight: "200px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "32px",
      }}>
      {loadingGenres && <PanelSkeleton variant="chart" label={t.genrePanel.loading} />}

      {!loadingGenres && hasData && (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          {chartType === "donut" && <DonutChart genres={genres} movieCount={movieCount} />}
          {chartType === "bar" && <BarChart genres={genres} />}
          {chartType === "matrix" && <MatrixChart genres={genres} movieCount={movieCount} />}
          {chartType === "gauges" && <GaugesChart genres={genres} />}
        </div>
      )}

      {!loadingGenres && hasData && (
        <GenreList genres={genres} movieCount={movieCount} movies={movies} />
      )}

      {!loadingGenres && !hasData && (
        <div style={{
          fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          letterSpacing: "2px", fontFamily: "var(--font-mono)",
        }}>
          {t.genrePanel.empty}
        </div>
      )}
    </Panel>
  )
}
