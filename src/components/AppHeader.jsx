const TABS = [
  { page: "profile", label: "Perfil", color: "var(--fg-rgb)" },
  { page: "quiz", label: "Quiz", color: "var(--accent-rgb)" },
  { page: "higher-lower", label: "Higher or Lower", color: "var(--warning-rgb)" },
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

export default function AppHeader({ page, showTabs, theme, onNavigate, onReset, onToggleTheme }) {
  const isLight = theme === "light"

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
            "linear-gradient(90deg, transparent, rgb(var(--accent-rgb) / 0.4), transparent)",
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

      <div className="rd-header-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {showTabs && (
          <nav aria-label="Secciones" style={{ display: "flex", gap: "12px", flex: 1 }}>
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
                    background: `rgb(${color} / ${active ? 0.15 : 0.03})`,
                    border: `1px solid rgb(${color} / ${active ? 0.6 : 0.2})`,
                    color: `rgb(${color} / ${active ? 1 : 0.6})`,
                  }}>
                  {label}
                </button>
              )
            })}
          </nav>
        )}

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
          title={isLight ? "Tema oscuro" : "Tema claro"}
          className="rd-theme-toggle">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isLight ? (
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  )
}
