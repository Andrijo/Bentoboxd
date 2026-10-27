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
          borderRadius: "var(--radius-md)",
          animation: "fadeSlideIn 0.4s ease both", animationDelay: `${i * 100}ms`,
        }}>
          <span aria-hidden="true" style={{
            fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)",
            color: "rgba(255,255,255,0.15)", lineHeight: 1,
          }}>
            0{i + 1}
          </span>
          <span style={{
            flex: 1, color: "#DBD5CA", fontSize: "var(--fs-sm)",
            letterSpacing: "1px",
          }}>
            {name}
          </span>
          <span style={{
            fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-mono)", letterSpacing: "1px",
            background: "rgba(255,255,255,0.05)",
            padding: "4px 8px", borderRadius: "var(--radius-sm)",
          }}>
            {count} film{count !== 1 ? "s" : ""}
          </span>
        </div>
      ))}
    </div>
  )
}
