const rankColors = [
  "#4ade80", "#f472b6", "#00e5ff", "#c084fc", "#facc15",
  "#fb7185", "#2ecc71", "#3498db", "#9b59b6",
]

export default function ActorsGrid({ actors }) {
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px",
    }}>
      {topActors.map(([name, count], i) => {
        const color = rankColors[i] || rankColors[0]
        return (
          <div key={name} style={{
            display: "flex", alignItems: "center",
            background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)",
            borderBottom: `2px solid ${color}`, padding: "12px 16px",
            borderRadius: "4px", animation: "fadeSlideIn 0.3s ease both",
            animationDelay: `${i * 50}ms`,
          }}>
            <div className="rd-rank-circle" style={{
              background: `${color}15`,
              border: `1px solid ${color}40`,
              color: color,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{
                fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase",
                color: "#DBD5CA", whiteSpace: "nowrap", overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                {count} CRÉDITOS DETECTADOS
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
