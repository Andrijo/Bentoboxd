import { useMemo } from "react"
import RatingHistogram from "./RatingHistogram.jsx"
import { Skeleton } from "../Skeleton.jsx"
import { computeProfileStats } from "../../utils/profileStats.js"
import { formatMovieCount, formatWatchedDate } from "../../utils/formatters.js"

const TMDB_VERDICT = {
  kinder: "Más generoso que el promedio",
  harsher: "Más exigente que el promedio",
  same: "En línea con el promedio",
}

const formatRating = (value) => value.toFixed(1)

function StatTile({ label, value, detail }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: "var(--radius-md)", padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: "6px", minWidth: 0,
    }}>
      <div style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.55)", letterSpacing: "1px" }}>
        {label}
      </div>
      <div style={{ fontSize: "var(--fs-lg)", color: "#F0EDE5", lineHeight: 1.1 }}>
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.5)" }}>
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
        label="Contra TMDB"
        value={<Skeleton width="64px" height="1.4rem" />}
        detail="Comparando…"
      />
    )
  } else if (stats.tmdbDiff !== null) {
    const sign = stats.tmdbDiff > 0 ? "+" : stats.tmdbDiff < 0 ? "−" : ""
    tmdbTile = (
      <StatTile
        label="Contra TMDB"
        value={`${sign}${formatRating(Math.abs(stats.tmdbDiff))}`}
        detail={`${TMDB_VERDICT[stats.tmdbVerdict]} (${formatMovieCount(stats.tmdbCompared)})`}
      />
    )
  }

  return (
    <section aria-labelledby="rd-panel-resumen" style={{
      margin: "0 var(--gutter) 40px", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,0.02)", overflow: "hidden",
    }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 id="rd-panel-resumen" className="rd-panel-title">
          RESUMEN
        </h2>
        <div style={{
          fontSize: "var(--fs-2xs)", color: "rgba(255,255,255,0.55)",
          letterSpacing: "2px", marginTop: "4px",
        }}>
          {formatMovieCount(stats.total)}{period && ` · ${period}`}
        </div>
      </div>

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px",
        }}>
          <StatTile
            label="Tu promedio"
            value={stats.average === null ? "—" : formatRating(stats.average)}
            detail={
              stats.unratedCount > 0
                ? `${stats.unratedCount} sin calificar`
                : `${formatMovieCount(stats.ratedCount)} calificadas`
            }
          />
          {tmdbTile}
          <StatTile
            label="Me gusta"
            value={stats.likedCount}
            detail={`${Math.round((stats.likedCount / stats.total) * 100)}% de las vistas`}
          />
          <StatTile
            label="Revisiones"
            value={stats.rewatchCount}
            detail={stats.rewatchCount === 1 ? "Película vista otra vez" : "Películas vistas otra vez"}
          />
          {stats.topDecade !== null && (
            <StatTile
              label="Década favorita"
              value={`${stats.topDecade}s`}
              detail={formatMovieCount(stats.topDecadeCount)}
            />
          )}
        </div>

        {stats.ratedCount > 0 && <RatingHistogram distribution={stats.distribution} />}
      </div>
    </section>
  )
}
