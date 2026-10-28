import { formatMovieCount } from "../../utils/formatters.js"

export default function ActorsGrid({ actors }) {
  const topActors = Object.entries(actors || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px",
    }}>
      {topActors.map(([name, count], i) => {
        return (
          <div key={name} style={{
            display: "flex", alignItems: "center",
            background: "var(--c-inset-strong)", border: "1px solid rgb(var(--fg-rgb) / 0.05)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)", animation: "fadeSlideIn 0.3s ease both",
            animationDelay: `${i * 50}ms`,
          }}>
            <div className="rd-rank-circle">
              {i + 1}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{
                fontSize: "var(--fs-xs)", fontWeight: "bold",
                color: "var(--c-text)", whiteSpace: "nowrap", overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {name}
              </div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
                {formatMovieCount(count)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
