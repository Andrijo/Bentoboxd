import { useEffect, useMemo, useRef, useState } from "react"
import StatTile from "./StatsSummary/StatTile.jsx"
import { Skeleton } from "./Skeleton.jsx"
import { computeProfileStats } from "../utils/profileStats.js"
import { formatDuration, formatHours, formatMovieCount } from "../utils/formatters.js"
import { profileLink } from "../utils/profileUrl.js"

const COPY_RESET_MS = 2500

const COPY_LABELS = {
  idle: "Copiar enlace",
  copied: "Enlace copiado",
  failed: "No se pudo copiar",
}

const TMDB_VERDICT = {
  kinder: "Más alto que el público",
  harsher: "Más bajo que el público",
  same: "En línea con el público",
}

function CopyLinkButton({ username }) {
  const [status, setStatus] = useState("idle")
  const resetRef = useRef(null)

  useEffect(() => () => clearTimeout(resetRef.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profileLink(username))
      setStatus("copied")
    } catch {
      // Sin permiso o en un contexto no seguro.
      setStatus("failed")
    }
    clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setStatus("idle"), COPY_RESET_MS)
  }

  return (
    <>
      <button type="button" className="rd-btn-outline" onClick={copy}>
        {COPY_LABELS[status]}
      </button>
      <span role="status" className="rd-sr-only">
        {status !== "idle" && COPY_LABELS[status]}
      </span>
    </>
  )
}

export default function ProfileOverview({ movies, username, loading }) {
  const stats = useMemo(() => computeProfileStats(movies), [movies])
  const pending = <Skeleton width="64px" height="1.4rem" />

  let hoursTile = null
  if (loading) {
    hoursTile = <StatTile label="Tiempo viendo" value={pending} detail="Sumando duraciones…" />
  } else if (stats.runtimeCount > 0) {
    hoursTile = (
      <StatTile
        label="Tiempo viendo"
        value={formatHours(stats.runtimeMinutes)}
        detail={`${formatDuration(stats.runtimeMinutes / stats.runtimeCount)} por película`}
      />
    )
  }

  let tmdbTile = null
  if (loading) {
    tmdbTile = <StatTile label="Frente al público (TMDB)" value={pending} detail="Comparando…" />
  } else if (stats.tmdbDiff !== null) {
    const sign = stats.tmdbDiff > 0 ? "+" : stats.tmdbDiff < 0 ? "−" : ""
    tmdbTile = (
      <StatTile
        label="Frente al público (TMDB)"
        value={`${sign}${Math.abs(stats.tmdbDiff).toFixed(1)}`}
        detail={`${TMDB_VERDICT[stats.tmdbVerdict]} (${formatMovieCount(stats.tmdbCompared)})`}
      />
    )
  }

  return (
    <section className="rd-overview" aria-labelledby="rd-overview-title">
      <div className="rd-overview-head">
        <h2 id="rd-overview-title" className="rd-overview-title">@{username}</h2>
        <CopyLinkButton username={username} />
      </div>

      <div className="rd-overview-tiles">
        <StatTile
          label="Promedio"
          value={stats.average === null ? "—" : stats.average.toFixed(1)}
          detail={
            stats.unratedCount > 0
              ? `${stats.unratedCount} sin calificar`
              : `${formatMovieCount(stats.ratedCount)} calificadas`
          }
        />
        {hoursTile}
        {tmdbTile}
        {stats.perWeek !== null && (
          <StatTile
            label="Por semana"
            value={stats.perWeek.toFixed(1)}
            detail={`${formatMovieCount(stats.datedCount)} en ${stats.spanDays} día${stats.spanDays === 1 ? "" : "s"}`}
          />
        )}
      </div>
    </section>
  )
}
