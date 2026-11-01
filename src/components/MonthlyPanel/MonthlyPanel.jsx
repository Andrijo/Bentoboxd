import { useMemo } from "react"
import MonthlyChart from "./MonthlyChart.jsx"
import Panel from "../Panel/Panel.jsx"
import { FEED_LIMIT } from "../../hooks/useLetterboxdFeed.js"
import { computeMonthlyStats } from "../../utils/monthlyStats.js"
import { useMessages } from "../../i18n/index.js"

export default function MonthlyPanel({ movies }) {
  const t = useMessages()
  const months = useMemo(() => computeMonthlyStats(movies), [movies])
  const hasTrend = months.length > 1

  return (
    <Panel
      id="rd-panel-evolucion"
      area="monthly"
      title={t.monthly.title}
      subtitle={hasTrend && t.monthly.subtitle}>
      {hasTrend ? (
        <>
          <MonthlyChart months={months} />
          {/* El feed corta en FEED_LIMIT entradas: el mes más antiguo puede llegar a medias. */}
          {movies.length >= FEED_LIMIT && (
            <p className="rd-monthly-note">
              {t.monthly.firstMonthNote(FEED_LIMIT)}
            </p>
          )}
        </>
      ) : (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          fontFamily: "var(--font-mono)",
        }}>
          {t.monthly.notEnough}
        </div>
      )}
    </Panel>
  )
}
