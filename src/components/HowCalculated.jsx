import { useMessages } from "../i18n/index.js"

export default function HowCalculated({ style, children }) {
  const t = useMessages()

  return (
    <details className="rd-how" style={style}>
      <summary>{t.common.howCalculated}</summary>
      <p>{children}</p>
    </details>
  )
}
