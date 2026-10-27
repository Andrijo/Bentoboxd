const TABS = [
  { page: "profile", label: "Perfil", color: "219,213,202" },
  { page: "quiz", label: "Quiz", color: "0,229,255" },
  { page: "higher-lower", label: "Higher or Lower", color: "250,204,21" },
]

const tabBase = {
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-2xs)",
  letterSpacing: "2px",
  cursor: "pointer",
  transition: "all 0.2s",
  flex: "1 1 120px",
  textAlign: "center",
  whiteSpace: "nowrap",
  lineHeight: 1.2,
}

export default function AppHeader({ page, showTabs, onNavigate, onReset }) {
  return (
    <header className="rd-header-bar">
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)",
        }}
      />

      <h1
        className="rd-header-title"
        style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
        }}>
        <button
          onClick={onReset}
          type="button"
          aria-label="Bentoboxd, volver al inicio"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            color: "inherit",
            cursor: "pointer",
          }}>
          BENTOBOXD
        </button>
      </h1>

      {showTabs && (
        <nav
          aria-label="Secciones"
          className="rd-header-actions"
          style={{ display: "flex", gap: "12px" }}>
          {TABS.map(({ page: tab, label, color }) => {
            const active = page === tab
            return (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                type="button"
                aria-current={active ? "page" : undefined}
                className="rd-tab"
                style={{
                  ...tabBase,
                  background: `rgba(${color},${active ? 0.15 : 0.03})`,
                  border: `1px solid rgba(${color},${active ? 0.6 : 0.2})`,
                  color: `rgba(${color},${active ? 1 : 0.6})`,
                }}>
                {label}
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
