import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

export default function RadarChart({ genres }) {
  const cx = 200, cy = 200, r = 140
  const keys = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0 || true)
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const n = keys.length
  const levels = [0.25, 0.5, 0.75, 1.0]

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
    <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: "400px" }}>
      {levels.map((frac, li) => (
        <polygon key={li} points={gridPolygon(frac)} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {keys.map((_, i) => {
        const p = pointAt(i, 1)
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        )
      })}

      <path d={dataPath} fill="rgba(0,229,255,0.08)"
        stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeLinejoin="round" />

      {dataPoints.map((p, i) => {
        const k = keys[i]
        const cfg = GENRE_CONFIG[k]
        const val = genres[k] || 0
        if (val === 0) return null
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill={cfg.color} opacity={0.9} />
            <circle cx={p.x} cy={p.y} r={9} fill={cfg.color} opacity={0.15} />
          </g>
        )
      })}

      {keys.map((k, i) => {
        const lp = pointAt(i, 1.25)
        const cfg = GENRE_CONFIG[k]
        const val = genres[k] || 0
        return (
          <g key={i}>
            <text x={lp.x} y={lp.y - 6} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontFamily="'Space Mono', monospace"
              fill={val > 0 ? cfg.color : "rgba(255,255,255,0.2)"} letterSpacing="0.5">
              {cfg.icon} {k}
            </text>
            {val > 0 && (
              <text x={lp.x} y={lp.y + 8} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontFamily="'Space Mono', monospace" fill="rgba(255,255,255,0.4)">
                {val} film{val !== 1 ? "s" : ""}
              </text>
            )}
          </g>
        )
      })}

      <circle cx={cx} cy={cy} r={3} fill="rgba(0,229,255,0.4)" />
    </svg>
  )
}
