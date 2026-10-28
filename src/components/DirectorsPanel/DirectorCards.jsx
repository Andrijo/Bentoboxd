import { formatMovieCount } from "../../utils/formatters.js"

export default function DirectorCards({ directors }) {
  const topDirectors = Object.entries(directors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {topDirectors.map(([name, count], i) => (
        <div key={name} style={{
          display: "flex", alignItems: "center", gap: "16px",
          background: "var(--c-inset)", padding: "12px 20px",
          borderRadius: "var(--radius-md)",
          animation: "fadeSlideIn 0.4s ease both", animationDelay: `${i * 100}ms`,
        }}>
          <span aria-hidden="true" style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)",
            color: "rgb(var(--fg-rgb) / 0.15)", lineHeight: 1,
          }}>
            0{i + 1}
          </span>
          <span style={{
            flex: 1, color: "var(--c-text)", fontSize: "var(--fs-sm)",
            letterSpacing: "1px",
          }}>
            {name}
          </span>
          <span style={{
            fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
            fontFamily: "var(--font-mono)", letterSpacing: "1px",
            background: "rgb(var(--fg-rgb) / 0.05)",
            padding: "4px 8px", borderRadius: "var(--radius-sm)",
          }}>
            {formatMovieCount(count)}
          </span>
        </div>
      ))}
    </div>
  )
}
