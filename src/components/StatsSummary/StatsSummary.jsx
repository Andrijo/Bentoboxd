import { useMemo } from "react"
import RatingHistogram from "./RatingHistogram.jsx"
import StatTile from "./StatTile.jsx"
import { computeProfileStats } from "../../utils/profileStats.js"
import { formatMovieCount, formatWatchedDate, weekdayName } from "../../utils/formatters.js"
import Panel from "../Panel/Panel.jsx"

export default function StatsSummary({ movies }) {
  const stats = useMemo(() => computeProfileStats(movies), [movies])
  if (stats.total === 0) return null

  const from = formatWatchedDate(stats.firstWatched)
  const to = formatWatchedDate(stats.lastWatched)
  const period = from && to && from !== to ? `${from} – ${to}` : from

  return (
    <Panel
      id="rd-panel-resumen"
      area="stats"
      title="RESUMEN"
      subtitle={`${formatMovieCount(stats.total)}${period ? ` · ${period}` : ""}`}
      bodyStyle={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px",
      }}>
        <StatTile
          label="Me gusta"
          value={stats.likedCount}
          detail={`${Math.round((stats.likedCount / stats.total) * 100)}% de las vistas`}
        />
        <StatTile
          label="Vistas otra vez"
          value={stats.rewatchCount}
          detail={`${Math.round((stats.rewatchCount / stats.total) * 100)}% de las vistas`}
        />
        {stats.topWeekday !== null && (
          <StatTile
            label="Día más activo"
            value={weekdayName(stats.topWeekday)}
            detail={formatMovieCount(stats.topWeekdayCount)}
          />
        )}
        {stats.topDecade !== null && (
          <StatTile
            label="Década más vista"
            value={`${stats.topDecade}s`}
            detail={formatMovieCount(stats.topDecadeCount)}
          />
        )}
      </div>

      {stats.ratedCount > 0 && <RatingHistogram distribution={stats.distribution} />}
    </Panel>
  )
}
