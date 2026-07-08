const rankColors = ["#00e5ff", "#c084fc", "#facc15", "#4ade80", "#ff4444"]

export default function DirectorCards({ directors }) {
  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {topDirectors.map(([name, count], i) => (
        <div key={name} style={{
          display: "flex", alignItems: "center", gap: "16px",
          background: "rgba(0,0,0,0.3)", padding: "12px 20px",
          borderRadius: "4px", borderLeft: `2px solid ${rankColors[i] || rankColors[0]}`,
          animation: "fadeSlideIn 0.4s ease both", animationDelay: `${i * 100}ms`,
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem",
            color: "rgba(255,255,255,0.15)", lineHeight: 1,
          }}>
            0{i + 1}
          </span>
          <span style={{
            flex: 1, color: "#DBD5CA", fontSize: "0.85rem",
            textTransform: "uppercase", letterSpacing: "1px",
          }}>
            {name}
          </span>
          <span style={{
            fontSize: "0.6rem", color: rankColors[i] || rankColors[0],
            fontFamily: "'Space Mono', monospace", letterSpacing: "1px",
            background: `${rankColors[i] || rankColors[0]}15`,
            padding: "4px 8px", borderRadius: "2px",
          }}>
            {count} FILM{count !== 1 ? "S" : ""}
          </span>
        </div>
      ))}
    </div>
  )
}
