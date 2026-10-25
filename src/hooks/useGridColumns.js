import { useState, useCallback, useRef } from "react"

/**
 * Calcula cuántas columnas caben en el elemento observado.
 * Devuelve un callback ref (funciona aunque el elemento se monte tarde,
 * p. ej. al cambiar de vista) y el número de columnas.
 */
export function useGridColumns(minColumnWidth = 210) {
  const [columns, setColumns] = useState(5)
  const observerRef = useRef(null)

  const ref = useCallback(
    (el) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!el) return

      const measure = () => {
        const width = el.getBoundingClientRect().width
        if (width > 0) {
          setColumns(Math.max(2, Math.floor(width / minColumnWidth)))
        }
      }
      measure()
      if (typeof ResizeObserver === "undefined") return
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      observerRef.current = ro
    },
    [minColumnWidth],
  )

  return [ref, columns]
}
