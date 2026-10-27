export default function Panel({ id, area, title, subtitle, actions, style, bodyStyle, children }) {
  return (
    <section aria-labelledby={id} style={{
      gridArea: area, display: "flex", flexDirection: "column",
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius-lg)",
      background: "rgba(255,255,255,0.02)", overflow: "hidden", ...style,
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h2 id={id} className="rd-panel-title">
            {title}
          </h2>
          {subtitle && (
            <div style={{
              fontSize: "var(--fs-2xs)", color: "rgba(255,255,255,0.55)",
              letterSpacing: "2px", marginTop: "4px", fontFamily: "var(--font-mono)",
            }}>
              {subtitle}
            </div>
          )}
        </div>
        {actions}
      </div>

      <div style={{ flex: 1, padding: "24px", ...bodyStyle }}>
        {children}
      </div>
    </section>
  )
}
