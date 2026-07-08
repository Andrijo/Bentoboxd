const rankColors = [
  "#4ade80", "#f472b6", "#00e5ff", "#c084fc", "#facc15",
  "#fb7185", "#2ecc71", "#3498db", "#9b59b6",
]

export default function ActorsSpectrum({ actors }) {
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  const max = Math.max(...topActors.map((a) => a[1]), 1)

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      height: "200px", padding: "10px 0", gap: "8px",
    }}>
      {topActors.map(([name, count], i) => {
        const color = rankColors[i] || rankColors[0]
        const heightPct = (count / max) * 100
        return (
          <div key={name} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "8px",
            animation: "fadeSlideIn 0.5s ease both", animationDelay: `${i * 40}ms`,
          }}>
            <div style={{
              fontSize: "0.9rem", fontFamily: "'Space Mono', monospace",
              color: color, fontWeight: "bold",
            }}>
              {count}
            </div>
            <div style={{
              width: "100%", maxWidth: "20px", height: `${heightPct}%`,
              background: `linear-gradient(to top, ${color}20, ${color})`,
              boxShadow: `0 0 15px ${color}40`, borderRadius: "1px",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "2px", background: "#fff",
              }} />
            </div>
            <div style={{
              fontSize: "0.45rem", textAlign: "center",
              color: "rgba(255,255,255,0.5)", writingMode: "vertical-rl",
              transform: "rotate(180deg)", height: "60px", letterSpacing: "1px",
            }}>
              {name.toUpperCase()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
