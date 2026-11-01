import { useEffect, useMemo, useRef, useState } from "react"
import StatTile from "./StatsSummary/StatTile.jsx"
import HowCalculated from "./HowCalculated.jsx"
import { Skeleton } from "./Skeleton.jsx"
import { computeProfileStats } from "../utils/profileStats.js"
import { profileHeadline } from "../utils/profileHeadline.js"
import { formatDuration, formatFeedScope, formatHours, formatMovieCount } from "../utils/formatters.js"
import { profileLink } from "../utils/profileUrl.js"
import { useMessages } from "../i18n/index.js"

const COPY_RESET_MS = 2500

function CopyLinkButton({ username }) {
  const t = useMessages()
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
        {t.overview.copy[status]}
      </button>
      <span role="status" className="rd-sr-only">
        {status !== "idle" && t.overview.copy[status]}
      </span>
    </>
  )
}

export default function ProfileOverview({ movies, genres = {}, username, loading }) {
  const t = useMessages()
  const stats = useMemo(() => computeProfileStats(movies), [movies])
  const headline = profileHeadline(stats, genres)
  const pending = <Skeleton width="64px" height="1.4rem" />

  let hoursTile = null
  if (loading) {
    hoursTile = <StatTile label={t.overview.timeWatching} value={pending} detail={t.overview.addingRuntimes} />
  } else if (stats.runtimeCount > 0) {
    hoursTile = (
      <StatTile
        label={t.overview.timeWatching}
        value={formatHours(stats.runtimeMinutes)}
        detail={t.overview.perMovie(formatDuration(stats.runtimeMinutes / stats.runtimeCount))}
      />
    )
  }

  let tmdbTile = null
  if (loading) {
    tmdbTile = <StatTile label={t.overview.versusAudience} value={pending} detail={t.overview.comparing} />
  } else if (stats.tmdbDiff !== null) {
    const sign = stats.tmdbDiff > 0 ? "+" : stats.tmdbDiff < 0 ? "−" : ""
    const partial = stats.tmdbCompared < stats.ratedCount
    tmdbTile = (
      <StatTile
        label={t.overview.versusAudience}
        value={`${sign}${Math.abs(stats.tmdbDiff).toFixed(1)}`}
        detail={`${t.overview.verdict[stats.tmdbVerdict]}${partial ? ` (${formatMovieCount(stats.tmdbCompared)})` : ""}`}>
        <HowCalculated>
          {t.overview.versusHow}
        </HowCalculated>
      </StatTile>
    )
  }

  return (
    <section className="rd-overview" aria-labelledby="rd-overview-title">
      <div className="rd-overview-head">
        <div className="rd-overview-intro">
          <h2 id="rd-overview-title" className="rd-overview-title">@{username}</h2>
          <p className="rd-overview-scope">{formatFeedScope(stats)}</p>
          {headline &&<p className="rd-overview-headline">{headline}</p>}
        </div>
        <CopyLinkButton username={username} />
      </div>

      <div className="rd-overview-tiles">
        <StatTile
          label={t.overview.average}
          value={stats.average === null ? "—" : stats.average.toFixed(1)}
          detail={
            stats.unratedCount > 0
              ? t.overview.unratedCount(stats.unratedCount)
              : t.overview.ratedCount(stats.ratedCount)
          }
        />
        {hoursTile}
        {tmdbTile}
        {stats.perWeek !== null && (
          <StatTile
            label={t.overview.perWeek}
            value={stats.perWeek.toFixed(1)}
            detail={t.overview.moviesInDays(stats.datedCount, stats.spanDays)}
          />
        )}
      </div>
    </section>
  )
}
