import { useState, useCallback, useRef } from "react"

// Por debajo de este ancho (móvil) el grid usa 3 columnas angostas en vez de
// 2 anchas, para que ninguna ficha de 2 columnas ocupe todo el ancho.
const COMPACT_WIDTH = 600
const COMPACT_COLUMNS = 3

/** Alto de fila del bento: más bajo en móvil, donde las columnas son angostas. */
export const rowHeight = (compact) => (compact ? "150px" : "180px")

/**
 * Calcula cuántas columnas caben en el elemento observado.
 * Devuelve un callback ref (funciona aunque el elemento se monte tarde,
 * p. ej. al cambiar de vista), el número de columnas y si es el modo móvil.
 */
export function useGridColumns(minColumnWidth = 210) {
  const [layout, setLayout] = useState({ columns: 5, compact: false })
  const observerRef = useRef(null)

  const ref = useCallback(
    (el) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!el) return

      const measure = () => {
        const width = el.getBoundingClientRect().width
        if (width <= 0) return
        const compact = width < COMPACT_WIDTH
        const columns = compact
          ? COMPACT_COLUMNS
          : Math.max(2, Math.floor(width / minColumnWidth))
        setLayout((prev) =>
          prev.columns === columns && prev.compact === compact
            ? prev
            : { columns, compact },
        )
      }
      measure()
      if (typeof ResizeObserver === "undefined") return
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      observerRef.current = ro
    },
    [minColumnWidth],
  )

  return [ref, layout.columns, layout.compact]
}
