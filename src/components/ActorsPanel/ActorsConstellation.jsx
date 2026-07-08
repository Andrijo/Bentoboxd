const rankColors = [
  "#4ade80", "#f472b6", "#00e5ff", "#c084fc", "#facc15",
  "#fb7185", "#2ecc71", "#3498db", "#9b59b6",
]

export default function ActorsConstellation({ actors }) {
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const cx = 150, cy = 120

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg viewBox="0 0 300 240" style={{ width: "100%", maxWidth: "350px", overflow: "visible" }}>
        {topActors.map(([name, count], i) => {
          const color = rankColors[i] || rankColors[0]
          const angle = i * (360 / topActors.length) * (Math.PI / 180)
          const dist = 90 - i * 5
          const x = cx + dist * Math.cos(angle)
          const y = cy + dist * Math.sin(angle)

          return (
            <g key={name} style={{
              animation: "fadeSlideIn 0.8s ease both", animationDelay: `${i * 100}ms`,
            }}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={color}
                strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2" />
              <circle cx={x} cy={y} r={count + 3} fill={color}
                filter={`drop-shadow(0 0 4px ${color})`}>
                <animate attributeName="opacity" values="0.4;0.9;0.4"
                  dur={`${2 + i}s`} repeatCount="indefinite" />
              </circle>
              <text x={x} y={y - (count + 8)} textAnchor="middle" fontSize="7"
                fill="#F0EDE5" fontFamily="'Space Mono', monospace" opacity="0.8">
                {name.split(" ").pop()}
              </text>
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={3} fill="#fff" filter="drop-shadow(0 0 6px #fff)" />
      </svg>
    </div>
  )
}
