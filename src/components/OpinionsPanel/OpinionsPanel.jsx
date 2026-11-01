import { useMemo } from "react"
import { PanelSkeleton } from "../Skeleton.jsx"
import PosterImage from "../PosterImage.jsx"
import Panel from "../Panel/Panel.jsx"
import HowCalculated from "../HowCalculated.jsx"
import { computeDivergences } from "../../utils/divergences.js"
import { useMessages } from "../../i18n/index.js"

const GROUPS = [
  { key: "above", sign: "+" },
  { key: "below", sign: "−" },
]

const formatRating = (value) => value.toFixed(1)

function OpinionRow({ movie, diff, sign }) {
  const t = useMessages()

  return (
    <li>
      <a
        href={movie.link}
        target="_blank"
        rel="noopener noreferrer"
        className="rd-opinion-row">
        <span style={{
          position: "relative", width: "40px", height: "60px", flexShrink: 0,
          borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--c-inset-strong)",
        }}>
          {movie.poster && (
            <PosterImage
              src={movie.poster}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block", fontFamily: "var(--font-display)", fontSize: "var(--fs-md)",
            lineHeight: 1.1, color: "var(--c-text-bright)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {movie.title}
          </span>
          <span style={{
            display: "block", marginTop: "4px", fontSize: "var(--fs-xs)",
            color: "var(--c-text-muted)",
          }}>
            {t.opinionsPanel.compare(formatRating(movie.rating), formatRating(movie.metrics.rating))}
          </span>
        </span>

        <span style={{
          fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", color: "var(--c-text-bright)", flexShrink: 0,
        }}>
          {sign}{formatRating(Math.abs(diff))}
        </span>
        <span className="rd-sr-only">{t.common.opensInLetterboxd}</span>
      </a>
    </li>
  )
}

export default function OpinionsPanel({ movies, loading }) {
  const t = useMessages()
  const { above, below, compared } = useMemo(() => computeDivergences(movies), [movies])
  const groups = { above, below }
  const hasData = above.length + below.length > 0

  return (
    <Panel
      id="rd-panel-opiniones"
      area="opinions"
      title={t.opinionsPanel.title}
      subtitle={!loading && compared > 0 && t.opinionsPanel.subtitle}>
      {loading && <PanelSkeleton variant="rows" label={t.opinionsPanel.loading} />}

      {!loading && hasData && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px",
        }}>
          {GROUPS.map(({ key, sign }) => groups[key].length > 0 && (
            <section key={key} aria-label={t.opinionsPanel[key]}>
              <h3 style={{
                fontWeight: "inherit", fontSize: "var(--fs-xs)", letterSpacing: "2px",
                color: "var(--c-text-muted)", marginBottom: "12px",
              }}>
                {t.opinionsPanel[key]}
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {groups[key].map(({ movie, diff }) => (
                  <OpinionRow key={movie.link} movie={movie} diff={diff} sign={sign} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {!loading && !hasData && (
        <div style={{
          textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
          marginTop: "20px", fontFamily: "var(--font-mono)",
        }}>
          {compared > 0
            ? t.opinionsPanel.aligned
            : t.opinionsPanel.noRatings}
        </div>
      )}

      {!loading && compared > 0 && (
        <HowCalculated style={{ marginTop: "16px" }}>
          {t.opinionsPanel.how}
        </HowCalculated>
      )}
    </Panel>
  )
}
