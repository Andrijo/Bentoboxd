import { useMemo } from "react"
import RatingHistogram from "./RatingHistogram.jsx"
import { Skeleton } from "../Skeleton.jsx"
import { computeProfileStats } from "../../utils/profileStats.js"
import { formatDuration, formatMovieCount, formatWatchedDate, weekdayName } from "../../utils/formatters.js"
import Panel from "../Panel/Panel.jsx"

const TMDB_VERDICT = {
  kinder: "Más alto que el público",
  harsher: "Más bajo que el público",
  same: "En línea con el público",
}

const formatRating = (value) => value.toFixed(1)

function StatTile({ label, value, detail }) {
  return (
    <div style={{
      background: "var(--c-inset)", border: "1px solid rgb(var(--fg-rgb) / 0.05)",
      borderRadius: "var(--radius-md)", padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: "6px", minWidth: 0,
    }}>
      <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)", letterSpacing: "1px" }}>
        {label}
      </div>
      <div style={{ fontSize: "var(--fs-lg)", color: "var(--c-text-bright)", lineHeight: 1.1 }}>
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
          {detail}
        </div>
      )}
    </div>
  )
}

export default function StatsSummary({ movies, loading }) {
  const stats = useMemo(() => computeProfileStats(movies), [movies])
  if (stats.total === 0) return null

  const from = formatWatchedDate(stats.firstWatched)
  const to = formatWatchedDate(stats.lastWatched)
  const period = from && to && from !== to ? `${from} – ${to}` : from

  let tmdbTile
  if (loading) {
    tmdbTile = (
      <StatTile
        label="Frente al público (TMDB)"
        value={<Skeleton width="64px" height="1.4rem" />}
        detail="Comparando…"
      />
    )
  } else if (stats.tmdbDiff !== null) {
    const sign = stats.tmdbDiff > 0 ? "+" : stats.tmdbDiff < 0 ? "−" : ""
    tmdbTile = (
      <StatTile
        label="Frente al público (TMDB)"
        value={`${sign}${formatRating(Math.abs(stats.tmdbDiff))}`}
        detail={`${TMDB_VERDICT[stats.tmdbVerdict]} (${formatMovieCount(stats.tmdbCompared)})`}
      />
    )
  }

  let hoursTile
  if (loading) {
    hoursTile = (
      <StatTile
        label="Tiempo viendo"
        value={<Skeleton width="64px" height="1.4rem" />}
        detail="Sumando duraciones…"
      />
    )
  } else if (stats.runtimeCount > 0) {
    hoursTile = (
      <StatTile
        label="Tiempo viendo"
        value={formatDuration(stats.runtimeMinutes)}
        detail={`${formatDuration(stats.runtimeMinutes / stats.runtimeCount)} por película · ${formatMovieCount(stats.runtimeCount)}`}
      />
    )
  }

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
          label="Promedio"
          value={stats.average === null ? "—" : formatRating(stats.average)}
          detail={
            stats.unratedCount > 0
              ? `${stats.unratedCount} sin calificar`
              : `${formatMovieCount(stats.ratedCount)} calificadas`
          }
        />
        {hoursTile}
        {tmdbTile}
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
        {stats.perWeek !== null && (
          <StatTile
            label="Ritmo"
            value={`${stats.perWeek.toFixed(1)} por semana`}
            detail={`${formatMovieCount(stats.datedCount)} en ${stats.spanDays} día${stats.spanDays === 1 ? "" : "s"}`}
          />
        )}
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
