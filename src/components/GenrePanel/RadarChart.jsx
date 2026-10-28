import { formatMovieCount } from "../../utils/formatters.js"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

const levels = [0.25, 0.5, 0.75, 1.0]

export default function RadarChart({ genres }) {
  const cx = 200, cy = 200, r = 140
  const withData = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0)
  const keys = withData.length >= 5
    ? withData
    : [...withData, ...GENRE_KEYS.filter((k) => !withData.includes(k))].slice(0, 5)
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const n = keys.length

  const angleOf = (i) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pointAt = (i, fraction) => ({
    x: cx + r * fraction * Math.cos(angleOf(i)),
    y: cy + r * fraction * Math.sin(angleOf(i)),
  })

  const gridPolygon = (fraction) =>
    keys.map((_, i) => { const p = pointAt(i, fraction); return `${p.x},${p.y}` }).join(" ")

  const dataPoints = keys.map((k, i) => {
    const val = Math.min((genres[k] || 0) / total, 1)
    const frac = val > 0 ? 0.08 + val * 0.87 : 0
    return pointAt(i, frac)
  })

  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"

  return (
    <svg
      role="img"
      aria-label={`Gráfico de radar: ${keys.map((k) => `${k} ${genres[k] || 0}`).join(", ")}`}
      viewBox="0 0 400 400"
      style={{ width: "100%", maxWidth: "400px" }}>
      {levels.map((frac, li) => (
        <polygon key={li} points={gridPolygon(frac)} fill="none"
          stroke="rgb(var(--fg-rgb) / 0.05)" strokeWidth="1" />
      ))}

      {keys.map((_, i) => {
        const p = pointAt(i, 1)
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgb(var(--fg-rgb) / 0.08)" strokeWidth="1" />
        )
      })}

      <path d={dataPath} fill="rgb(var(--accent-rgb) / 0.08)"
        stroke="rgb(var(--accent-rgb) / 0.5)" strokeWidth="1.5" strokeLinejoin="round" />

      {dataPoints.map((p, i) => {
        const k = keys[i]
        const cfg = GENRE_CONFIG[k]
        const val = genres[k] || 0
        if (val === 0) return null
        return (
          <g key={k}>
            <circle cx={p.x} cy={p.y} r={5} fill={cfg.color} opacity={0.9} />
            <circle cx={p.x} cy={p.y} r={9} fill={cfg.color} opacity={0.15} />
          </g>
        )
      })}

      {keys.map((k, i) => {
        const lp = pointAt(i, 1.25)
        const val = genres[k] || 0
        return (
          <g key={k}>
            <text x={lp.x} y={lp.y - 6} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" style={{ fontFamily: "var(--font-mono)" }}
              fill={val > 0 ? "var(--c-text)" : "var(--c-text-muted)"} letterSpacing="0.5">
              {k}
            </text>
            {val > 0 && (
              <text x={lp.x} y={lp.y + 8} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" style={{ fontFamily: "var(--font-mono)" }} fill="var(--c-text-muted)">
                {formatMovieCount(val)}
              </text>
            )}
          </g>
        )
      })}

      <circle cx={cx} cy={cy} r={3} fill="rgb(var(--accent-rgb) / 0.4)" />
    </svg>
  )
}
