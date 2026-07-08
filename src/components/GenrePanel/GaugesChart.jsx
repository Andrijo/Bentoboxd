import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

export default function GaugesChart({ genres }) {
  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )
  const maxCount = Math.max(...sortedGenres.map((k) => genres[k]), 1)

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
      gap: "24px", width: "100%", padding: "10px",
    }}>
      {sortedGenres.map((k, i) => {
        const count = genres[k]
        const cfg = GENRE_CONFIG[k]
        const percent = count / maxCount
        const r = 36
        const circ = 2 * Math.PI * r
        const dashOffset = circ - percent * circ

        return (
          <div key={k} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
            animation: "fadeSlideIn 0.5s ease both", animationDelay: `${i * 60}ms`,
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "80px", height: "80px", overflow: "visible" }}>
              <defs>
                <filter id={`glow-${k}`}>
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="50" cy="50" r={r - 12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4" />

              <circle cx="50" cy="50" r={r} fill="none" stroke={cfg.color} strokeWidth="6"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)" filter={`url(#glow-${k})`}
                style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)" }}
              />

              <text x="50" y="58" textAnchor="middle" fontSize="26"
                fontFamily="'Bebas Neue', sans-serif" fill="#F0EDE5">
                {count}
              </text>
            </svg>

            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "0.65rem", fontFamily: "'Space Mono', monospace",
                color: cfg.color, letterSpacing: "1px", textTransform: "uppercase",
              }}>
                {cfg.icon} {k}
              </div>
              <div style={{
                fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
                fontFamily: "'Space Mono', monospace", marginTop: "2px",
              }}>
                {Math.round(percent * 100)}% DEL MÁXIMO
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
