import { useMemo } from "react"
import RatingHistogram from "./RatingHistogram.jsx"
import StatTile from "./StatTile.jsx"
import { computeProfileStats } from "../../utils/profileStats.js"
import { formatMovieCount, formatWatchedDate, weekdayName } from "../../utils/formatters.js"
import Panel from "../Panel/Panel.jsx"
import { useMessages } from "../../i18n/index.js"

export default function StatsSummary({ movies }) {
  const t = useMessages()
  const stats = useMemo(() => computeProfileStats(movies), [movies])
  if (stats.total === 0) return null

  const from = formatWatchedDate(stats.firstWatched)
  const to = formatWatchedDate(stats.lastWatched)
  const period = from && to && from !== to ? `${from} – ${to}` : from

  return (
    <Panel
      id="rd-panel-resumen"
      area="stats"
      title={t.summary.title}
      subtitle={`${formatMovieCount(stats.total)}${period ? ` · ${period}` : ""}`}
      bodyStyle={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px",
      }}>
        <StatTile
          label={t.common.liked}
          value={stats.likedCount}
          detail={t.summary.ofWatched(Math.round((stats.likedCount / stats.total) * 100))}
        />
        <StatTile
          label={t.summary.rewatches}
          value={stats.rewatchCount}
          detail={t.summary.ofWatched(Math.round((stats.rewatchCount / stats.total) * 100))}
        />
        {stats.topWeekday !== null && (
          <StatTile
            label={t.summary.mostActiveDay}
            value={weekdayName(stats.topWeekday)}
            detail={formatMovieCount(stats.topWeekdayCount)}
          />
        )}
        {stats.topDecade !== null && (
          <StatTile
            label={t.summary.topDecade}
            value={t.summary.decade(stats.topDecade)}
            detail={formatMovieCount(stats.topDecadeCount)}
          />
        )}
      </div>

      {stats.ratedCount > 0 && <RatingHistogram distribution={stats.distribution} />}
    </Panel>
  )
}
