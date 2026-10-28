import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

export default function BarChart({ genres }) {
  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )
  const maxCount = Math.max(...sortedGenres.map((k) => genres[k]), 1)

  return (
    <div aria-hidden="true" style={{
      width: "100%", maxWidth: "400px", display: "flex",
      flexDirection: "column", gap: "12px", padding: "10px 0",
    }}>
      {sortedGenres.map((k, i) => {
        const count = genres[k]
        const cfg = GENRE_CONFIG[k]
        const widthPct = (count / maxCount) * 100

        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              flex: 1, height: "12px", background: "rgb(var(--fg-rgb) / 0.03)",
              border: "1px solid rgb(var(--fg-rgb) / 0.08)", borderRadius: "2px",
              overflow: "visible", position: "relative",
            }}>
              <div style={{
                height: "100%", width: `${widthPct}%`,
                background: `linear-gradient(90deg, transparent, ${cfg.color})`,
                borderRight: `2px solid ${cfg.color}`,
                animation: "fadeSlideIn 0.8s ease both",
                animationDelay: `${i * 100}ms`,
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", right: 0, top: 0, bottom: 0,
                  width: "4px", background: "var(--c-text-bright)", opacity: 0.5,
                }} />
              </div>
            </div>

            <div style={{
              width: "25px", fontSize: "var(--fs-sm)", fontFamily: "var(--font-display)",
              color: cfg.color, letterSpacing: "1px",
            }}>
              {count}
            </div>
          </div>
        )
      })}
    </div>
  )
}
