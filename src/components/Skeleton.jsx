import { useMemo } from "react"
import { generateBentoLayout, VISIBLE_MOVIES } from "./BentoGrid/bentoPatterns.js"
import { useGridColumns } from "../hooks/useGridColumns.js"

const SIZES = {
  1: { gridColumn: "span 1", gridRow: "span 1" },
  2: { gridColumn: "span 2", gridRow: "span 1" },
  3: { gridColumn: "span 2", gridRow: "span 2" },
}

export function Skeleton({ width = "100%", height = "12px", radius = "4px", style }) {
  return (
    <div
      className="rd-skeleton"
      aria-hidden="true"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  )
}

/** Misma forma que el bento real, para que no salte el layout al cargar. */
export function BentoSkeleton() {
  const [gridRef, columns] = useGridColumns()
  const layout = useMemo(
    () => generateBentoLayout(columns, VISIBLE_MOVIES),
    [columns],
  )

  return (
    <div style={{ padding: "32px 40px" }} role="status" aria-busy="true">
      <span className="rd-sr-only">Cargando películas…</span>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}>
        <Skeleton width="240px" height="14px" />
        <Skeleton width="300px" height="30px" radius="3px" />
      </div>
      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
          gridAutoRows: "180px",
          gap: "8px",
        }}>
        {Array.from({ length: VISIBLE_MOVIES }, (_, i) => (
          <Skeleton
            key={i}
            height="100%"
            style={SIZES[layout.sizes[i] || 1]}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Placeholder del contenido de un panel de datos.
 * - rows:  filas tipo ranking (directores, actores, países)
 * - tiles: tarjetas en cuadrícula (plataformas)
 * - chart: gráfica circular con leyenda (géneros)
 */
export function PanelSkeleton({ variant = "rows", label = "Cargando…" }) {
  return (
    <div role="status" aria-busy="true" style={{ width: "100%" }}>
      <span className="rd-sr-only">{label}</span>

      {variant === "rows" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[90, 75, 60, 50, 40].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Skeleton width="32px" height="32px" radius="50%" />
              <Skeleton width={`${w}%`} height="14px" />
            </div>
          ))}
        </div>
      )}

      {variant === "tiles" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
          }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} height="52px" />
          ))}
        </div>
      )}

      {variant === "chart" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            flexWrap: "wrap",
          }}>
          <Skeleton width="180px" height="180px" radius="50%" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "200px" }}>
            {[100, 85, 70, 55, 40].map((w, i) => (
              <Skeleton key={i} width={`${w}%`} height="12px" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
