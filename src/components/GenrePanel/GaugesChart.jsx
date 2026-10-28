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

              <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(var(--fg-rgb) / 0.05)" strokeWidth="6" />
              <circle cx="50" cy="50" r={r - 12} fill="none" stroke="rgb(var(--fg-rgb) / 0.08)" strokeWidth="1" strokeDasharray="2 4" />

              <circle cx="50" cy="50" r={r} fill="none" stroke={cfg.color} strokeWidth="6"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)" filter={`url(#glow-${k})`}
                style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)" }}
              />

              <text x="50" y="58" textAnchor="middle" fontSize="26"
                style={{ fontFamily: "var(--font-display)" }} fill="var(--c-text-bright)">
                {count}
              </text>
            </svg>

            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "var(--fs-2xs)", fontFamily: "var(--font-mono)",
                color: cfg.color, letterSpacing: "1px",
              }}>
                {k}
              </div>
              <div style={{
                fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
                fontFamily: "var(--font-mono)", marginTop: "2px",
              }}>
                {Math.round(percent * 100)}% del máximo
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
