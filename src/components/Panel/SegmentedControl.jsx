export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div role="group" className="rd-segmented" aria-label={label} style={{
      display: "flex", flexWrap: "wrap", gap: "4px", background: "var(--c-inset)",
      borderRadius: "var(--radius-md)", padding: "3px",
      border: "1px solid rgb(var(--fg-rgb) / 0.07)",
    }}>
      {options.map(({ key, label: optionLabel }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          type="button"
          aria-pressed={value === key}
          style={{
            background: value === key ? "rgb(var(--fg-rgb) / 0.08)" : "transparent",
            border: value === key
              ? "1px solid rgb(var(--fg-rgb) / 0.2)"
              : "1px solid transparent",
            color: value === key ? "var(--c-text-bright)" : "var(--c-text-muted)",
            padding: "5px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer",
            fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
            letterSpacing: "1.5px", transition: "background 0.2s, border-color 0.2s, color 0.2s",
          }}>
          {optionLabel}
        </button>
      ))}
    </div>
  )
}
