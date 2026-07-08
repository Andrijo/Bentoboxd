import { useState } from "react"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

export default function DonutChart({ genres }) {
  const cx = 180, cy = 180, outerR = 130, innerR = 72
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const activeGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0)
  const [hovered, setHovered] = useState(null)

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const { slices } = activeGenres.reduce(
    (acc, k) => {
      const count = genres[k] || 0
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
        display: "flex",
        alignItems: "center",
        gap: "32px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
      <svg
        viewBox="0 0 360 360"
        style={{ width: "100%", maxWidth: "300px", overflow: "visible" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
              filter={isHovered ? "url(#glow)" : undefined}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {hoveredSlice ? (
          <>
            <text x={cx} y={cy - 16} textAnchor="middle" fontSize="22" fill={hoveredSlice.cfg.color}>
              {hoveredSlice.cfg.icon}
            </text>
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill={hoveredSlice.cfg.color}
              fontFamily="'Space Mono', monospace" letterSpacing="0.5">
              {hoveredSlice.k}
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fill="white"
              fontFamily="'Space Mono', monospace" fontWeight="bold">
              {hoveredSlice.count} film{hoveredSlice.count !== 1 ? "s" : ""}
            </text>
            <text x={cx} y={cy + 32} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)"
              fontFamily="'Space Mono', monospace">
              {Math.round(hoveredSlice.fraction * 100)}%
            </text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fill="rgba(255,255,255,0.8)"
              fontFamily="'Bebas Neue', sans-serif" letterSpacing="2">
              {total}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)"
              fontFamily="'Space Mono', monospace" letterSpacing="1">
              FILMS
            </text>
          </>
        )}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {slices.map((s, i) => (
          <div
            key={s.k}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              cursor: "pointer",
              opacity: hovered === null ? 1 : hovered === i ? 1 : 0.4,
              transition: "opacity 0.2s",
            }}>
            <div
              style={{
                width: "8px", height: "8px", borderRadius: "2px",
                background: s.cfg.color, flexShrink: 0,
                boxShadow: hovered === i ? `0 0 8px ${s.cfg.glow}` : "none",
                transition: "box-shadow 0.2s",
              }}
            />
            <span style={{
              fontSize: "0.6rem", fontFamily: "'Space Mono', monospace",
              color: hovered === i ? s.cfg.color : "rgba(255,255,255,0.6)",
              transition: "color 0.2s", letterSpacing: "0.5px",
            }}>
              {s.cfg.icon} {s.k}
            </span>
            <span style={{
              marginLeft: "auto", paddingLeft: "12px",
              fontSize: "0.55rem", fontFamily: "'Space Mono', monospace",
              color: "rgba(255,255,255,0.35)",
            }}>
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
