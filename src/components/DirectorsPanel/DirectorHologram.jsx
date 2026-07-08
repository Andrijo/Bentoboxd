const rankColors = ["#00e5ff", "#c084fc", "#facc15", "#4ade80", "#ff4444"]

export default function DirectorHologram({ directors }) {
  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const max = Math.max(...topDirectors.map((d) => d[1]), 1)

  return (
    <div style={{
      display: "flex", justifyContent: "space-evenly", alignItems: "flex-end",
      height: "200px", padding: "20px 0",
    }}>
      {topDirectors.map(([name, count], i) => {
        const color = rankColors[i] || rankColors[0]
        const heightPct = (count / max) * 100

        return (
          <div key={name} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "12px", width: "60px",
            animation: "fadeSlideIn 0.6s ease both", animationDelay: `${i * 80}ms`,
          }}>
            <div style={{
              fontSize: "1.2rem", fontFamily: "'Bebas Neue', sans-serif",
              color: color, textShadow: `0 0 10px ${color}`,
            }}>
              {count}
            </div>
            <div style={{
              width: "30px", height: `${Math.max(heightPct, 15)}px`,
              background: `linear-gradient(to top, transparent, ${color}90)`,
              borderTop: `3px solid ${color}`, boxShadow: `0 -10px 20px ${color}60`,
              borderRadius: "2px 2px 0 0", position: "relative",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)", width: "1px", height: "100%",
                background: "rgba(255,255,255,0.3)",
              }} />
            </div>
            <div style={{
              fontSize: "0.55rem", textAlign: "center",
              color: "rgba(255,255,255,0.7)", letterSpacing: "1px", height: "30px",
            }}>
              {name.split(" ").map((word, idx) => (
                <div key={idx}>{word}</div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
