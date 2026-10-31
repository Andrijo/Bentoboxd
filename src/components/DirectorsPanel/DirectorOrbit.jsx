import { formatMovieCount } from "../../utils/formatters.js"

const rankColors = ["var(--ramp-1)", "var(--ramp-3)", "var(--ramp-5)", "var(--ramp-7)", "var(--ramp-9)"]
const radii = [40, 70, 100, 130, 160]

export default function DirectorOrbit({ directors }) {
  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const cx = 150, cy = 150

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
      <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: "280px", overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={8} style={{ fill: "var(--c-text-bright)" }} opacity={0.8} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="6"
          style={{ fontFamily: "var(--font-mono)", fill: "var(--c-on-text)" }} fontWeight="bold">
          @
        </text>

        {topDirectors.map(([name, count], i) => {
          const color = rankColors[i] || rankColors[0]
          const r = radii[i]
          const angleDeg = i * 72 - 90
          const angleRad = (angleDeg * Math.PI) / 180
          const x = cx + r * Math.cos(angleRad)
          const y = cy + r * Math.sin(angleRad)

          return (
            <g key={name} style={{
              animation: "fadeSlideIn 1s ease both", animationDelay: `${i * 150}ms`,
            }}>
              <circle cx={cx} cy={cy} r={r} fill="none"
                stroke="rgb(var(--fg-rgb) / 0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={x} cy={y} r={count * 2 + 4} fill={color}
                opacity={0.8} />
              <text x={x + (x > cx ? 12 : -12)} y={y}
                textAnchor={x > cx ? "start" : "end"} dominantBaseline="middle"
                fontSize="8" fill="var(--c-text-bright)" style={{ fontFamily: "var(--font-mono)" }} letterSpacing="0.5">
                {name}
              </text>
              <text x={x + (x > cx ? 12 : -12)} y={y + 10}
                textAnchor={x > cx ? "start" : "end"} fontSize="6"
                fill={color} style={{ fontFamily: "var(--font-mono)" }}>
                {formatMovieCount(count)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
