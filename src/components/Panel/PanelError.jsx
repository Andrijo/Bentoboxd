export default function PanelError({ message }) {
  return (
    <div role="alert" style={{
      textAlign: "center", fontSize: "var(--fs-xs)", color: "rgb(var(--danger-rgb) / 0.8)",
      letterSpacing: "1px", fontFamily: "var(--font-mono)",
    }}>
      <span aria-hidden="true">⚠ </span>{message}
    </div>
  )
}
