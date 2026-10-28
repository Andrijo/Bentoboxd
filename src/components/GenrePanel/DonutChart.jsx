import { useState } from "react"
import { formatMovieCount } from "../../utils/formatters.js"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const MAX_SLICES = 6

/** Las rebanadas más grandes y el resto agrupado en "Otro", ordenadas por tamaño. */
function groupGenres(genres) {
  const ranked = GENRE_KEYS.filter((k) => k !== "Otro" && (genres[k] || 0) > 0)
    .sort((a, b) => genres[b] - genres[a])
  const kept = ranked.slice(0, MAX_SLICES)
  const rest = ranked.slice(MAX_SLICES).reduce((sum, k) => sum + genres[k], 0)
  const other = rest + (genres.Otro || 0)
  return [...kept.map((k) => [k, genres[k]]), ...(other > 0 ? [["Otro", other]] : [])]
}

export default function DonutChart({ genres, movieCount }) {
  const cx = 180, cy = 180, outerR = 168, innerR = 98
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const grouped = groupGenres(genres)
  const films = movieCount || total
  const [hovered, setHovered] = useState(null)

  const { slices } = grouped.reduce(
    (acc, [k, count]) => {
      const fraction = count / total
      const sweep = fraction * 360
      const start = acc.angle
      const end = acc.angle + sweep
      const cfg = GENRE_CONFIG[k]
      acc.slices.push({ k, count, fraction, startAngle: start, endAngle: end, midAngle: start + sweep / 2, cfg })
      acc.angle = end
      return acc
    },
    { slices: [], angle: 0 },
  )

  const hoveredSlice = hovered !== null ? slices[hovered] : null

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "32px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
      <svg
        role="group"
        aria-label="Gráfico de pastel de géneros"
        viewBox="0 0 360 360"
        style={{ width: "100%", maxWidth: "380px", overflow: "visible" }}>
        {slices.map((s, i) => {
          const isHovered = hovered === i
          const gap = 2
          const outerRad = isHovered ? outerR + 8 : outerR
          const largeArc = s.endAngle - s.startAngle > 180 ? "1" : "0"

          const startOuter = polarToCartesian(cx, cy, outerRad, s.startAngle + gap * 0.5)
          const endOuter = polarToCartesian(cx, cy, outerRad, s.endAngle - gap * 0.5)
          const startInner = polarToCartesian(cx, cy, innerR, s.startAngle + gap * 0.5)
          const endInner = polarToCartesian(cx, cy, innerR, s.endAngle - gap * 0.5)

          const fullPath = `
            M ${startOuter.x} ${startOuter.y}
            A ${outerRad} ${outerRad} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
            L ${endInner.x} ${endInner.y}
            A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}
            Z
          `

          return (
            <path
              key={s.k}
              d={fullPath}
              fill={s.cfg.color}
              opacity={hovered === null ? 0.85 : isHovered ? 1 : 0.35}
              role="img"
              aria-label={`${s.k}: ${formatMovieCount(s.count)}`}
              tabIndex={0}
              style={{ cursor: "pointer", transition: "opacity 0.2s", outline: "none" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onClick={() => setHovered((h) => (h === i ? null : i))}
            />
          )
        })}

        {hoveredSlice ? (
          <>
            <text x={cx} y={cy - 18} textAnchor="middle" fontSize="18" fill="var(--c-text)"
              style={{ fontFamily: "var(--font-mono)" }} letterSpacing="0.5">
              {hoveredSlice.k}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="22" fill="var(--c-text-bright)"
              style={{ fontFamily: "var(--font-mono)" }} fontWeight="bold">
              {formatMovieCount(hoveredSlice.count)}
            </text>
            <text x={cx} y={cy + 32} textAnchor="middle" fontSize="16" fill="var(--c-text-muted)"
              style={{ fontFamily: "var(--font-mono)" }}>
              {Math.round((hoveredSlice.count / films) * 100)}% de tus películas
            </text>
          </>
        ) : (
          <>
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="48" fill="rgb(var(--fg-rgb) / 0.8)"
              style={{ fontFamily: "var(--font-display)" }} letterSpacing="2">
              {films}
            </text>
            <text x={cx} y={cy + 32} textAnchor="middle" fontSize="15" fill="var(--c-text-muted)"
              style={{ fontFamily: "var(--font-mono)" }} letterSpacing="1">
              {films === 1 ? "película" : "películas"}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
