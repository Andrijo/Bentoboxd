import { useMemo } from "react"
import MonthlyChart from "./MonthlyChart.jsx"
import Panel from "../Panel/Panel.jsx"
import { FEED_LIMIT } from "../../hooks/useLetterboxdFeed.js"
import { computeMonthlyStats } from "../../utils/monthlyStats.js"

export default function MonthlyPanel({ movies }) {
  const months = useMemo(() => computeMonthlyStats(movies), [movies])
  const hasTrend = months.length > 1

  return (
    <Panel
      id="rd-panel-evolucion"
      area="monthly"
      title="EVOLUCIÓN MENSUAL"
      subtitle={hasTrend && "Según la fecha en que se vio cada película"}>
      {hasTrend ? (
        <>
          <MonthlyChart months={months} />
          {/* El feed corta en FEED_LIMIT entradas: el mes más antiguo puede llegar a medias. */}
          {movies.length >= FEED_LIMIT && (
            <p className="rd-monthly-note">
              El primer mes puede estar incompleto: Letterboxd solo comparte las últimas {FEED_LIMIT} entradas.
            </p>
          )}
        </>
      ) : (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          fontFamily: "var(--font-mono)",
        }}>
          Hacen falta entradas fechadas en al menos 2 meses para ver la evolución
        </div>
      )}
    </Panel>
  )
}
