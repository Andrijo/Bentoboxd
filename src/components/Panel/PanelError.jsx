export default function PanelError({ message }) {
  return (
    <div role="alert" style={{
      textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--c-text)",
      letterSpacing: "1px", fontFamily: "var(--font-mono)",
    }}>
      <span aria-hidden="true">⚠ </span>{message}
    </div>
  )
}
