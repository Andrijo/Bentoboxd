const rankColors = ["#00e5ff", "#c084fc", "#facc15", "#4ade80", "#ff4444"]
const radii = [40, 70, 100, 130, 160]

export default function DirectorOrbit({ directors }) {
  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const cx = 150, cy = 150

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
      <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: "280px", overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={8} fill="#ffffff" opacity={0.8} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="6"
          fontFamily="'Space Mono', monospace" fill="#000" fontWeight="bold">
          TÚ
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
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={x} cy={y} r={count * 2 + 4} fill={color}
                opacity={0.8} filter={`drop-shadow(0 0 5px ${color})`} />
              <text x={x + (x > cx ? 12 : -12)} y={y}
                textAnchor={x > cx ? "start" : "end"} dominantBaseline="middle"
                fontSize="8" fill="#F0EDE5" fontFamily="'Space Mono', monospace" letterSpacing="0.5">
                {name}
              </text>
              <text x={x + (x > cx ? 12 : -12)} y={y + 10}
                textAnchor={x > cx ? "start" : "end"} fontSize="6"
                fill={color} fontFamily="'Space Mono', monospace">
                {count} FILMS
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
