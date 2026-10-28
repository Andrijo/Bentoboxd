import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

export default function GenreList({ genres }) {
  const total = Object.values(genres).reduce((a, b) => a + b, 0) || 1
  const ranked = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )

  return (
    <ol aria-label="Géneros por frecuencia" style={{
      width: "100%", margin: 0, padding: 0, listStyle: "none",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      {ranked.map((k, i) => {
        const count = genres[k]
        const color = GENRE_CONFIG[k].color
        return (
          <li key={k} style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "var(--c-inset-strong)", border: "1px solid rgb(var(--fg-rgb) / 0.05)",
            borderRadius: "var(--radius-md)", padding: "8px 14px",
            animation: "fadeSlideIn 0.3s ease both", animationDelay: `${i * 40}ms`,
          }}>
            <span aria-hidden="true" style={{
              width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
              background: color,
            }} />
            <span style={{
              flex: 1, fontSize: "var(--fs-xs)", fontWeight: "bold", color: "var(--c-text)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {k}
            </span>
            <span style={{
              fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
              color: "var(--c-text-muted)",
            }}>
              {Math.round((count / total) * 100)}%
            </span>
            <span style={{
              minWidth: "24px", textAlign: "right", fontSize: "var(--fs-sm)",
              fontFamily: "var(--font-display)", letterSpacing: "1px", color,
            }}>
              {count}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
