import { useState } from "react"

/** Monta `children` en la primera visita y luego solo los oculta, para conservar su estado. */
export default function KeepAlive({ active, children }) {
  const [visited, setVisited] = useState(active)
  if (active && !visited) setVisited(true)

  if (!visited) return null
  return <div hidden={!active}>{children}</div>
}
