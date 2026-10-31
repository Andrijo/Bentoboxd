export default function StatTile({ label, value, detail }) {
  return (
    <div style={{
      background: "var(--c-inset)", border: "1px solid rgb(var(--fg-rgb) / 0.05)",
      borderRadius: "var(--radius-md)", padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: "6px", minWidth: 0,
    }}>
      <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)", letterSpacing: "1px" }}>
        {label}
      </div>
      <div style={{ fontSize: "var(--fs-lg)", color: "var(--c-text-bright)", lineHeight: 1.1 }}>
        {value}
      </div>
      {detail && (
        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-text-muted)" }}>
          {detail}
        </div>
      )}
    </div>
  )
}
