export default function HowCalculated({ style, children }) {
  return (
    <details className="rd-how" style={style}>
      <summary>Cómo se calcula</summary>
      <p>{children}</p>
    </details>
  )
}
