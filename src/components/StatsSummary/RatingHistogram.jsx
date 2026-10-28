import { useState } from "react"
import { formatMovieCount } from "../../utils/formatters.js"

const CHART_HEIGHT = 120

/**
 * Distribución de calificaciones: una sola serie en el acento. La barra más
 * alta va a color completo y el resto atenuadas (énfasis, no categorías).
 */
export default function RatingHistogram({ distribution }) {
  const [active, setActive] = useState(null)
  const max = Math.max(...distribution.map((d) => d.count))
  const mode = distribution.find((d) => d.count === max)

  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{
        fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
        letterSpacing: "1px", marginBottom: "12px",
      }}>
        Tus calificaciones · la más frecuente es {mode.rating}★
      </figcaption>

      <div aria-hidden="true" style={{ position: "relative" }}>
        <div style={{
          height: `${CHART_HEIGHT}px`, display: "flex", alignItems: "flex-end", gap: "4px",
          borderBottom: "1px solid rgb(var(--fg-rgb) / 0.12)",
        }}>
          {distribution.map((d) => {
            const isMode = d === mode
            const isActive = active === d.rating
            return (
              // Zona de hover de toda la columna, más grande que la barra.
              <div
                key={d.rating}
                onMouseEnter={() => setActive(d.rating)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive((a) => (a === d.rating ? null : d.rating))}
                style={{
                  flex: 1, height: "100%", position: "relative",
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  alignItems: "center",
                }}>
                {(isMode || isActive) && d.count > 0 && (
                  <span style={{
                    fontSize: "var(--fs-xs)", color: "var(--c-text-bright)", marginBottom: "4px",
                  }}>
                    {d.count}
                  </span>
                )}
                <div style={{
                  width: "100%", maxWidth: "48px",
                  height: d.count ? `${Math.max(4, (d.count / max) * (CHART_HEIGHT - 24))}px` : 0,
                  borderRadius: "4px 4px 0 0",
                  background: isMode || isActive ? "var(--c-accent)" : "rgb(var(--accent-rgb) / 0.35)",
                  transition: "background 0.15s",
                }} />
                {isActive && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                    marginBottom: "-8px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 2,
                    background: "var(--c-card)", border: "1px solid rgb(var(--fg-rgb) / 0.15)",
                    borderRadius: "var(--radius-sm)", padding: "4px 8px",
                    fontSize: "var(--fs-xs)", color: "var(--c-text-bright)",
                  }}>
                    {d.rating}★ · {formatMovieCount(d.count)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Etiquetas solo en estrellas enteras para no amontonar. */}
        <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
          {distribution.map((d) => (
            <span key={d.rating} style={{
              flex: 1, textAlign: "center",
              fontSize: "var(--fs-xs)", color: "var(--c-text-muted)",
            }}>
              {Number.isInteger(d.rating) ? `${d.rating}★` : ""}
            </span>
          ))}
        </div>
      </div>

      <table className="rd-sr-only">
        <caption>Películas por calificación</caption>
        <thead>
          <tr><th scope="col">Calificación</th><th scope="col">Películas</th></tr>
        </thead>
        <tbody>
          {distribution.map((d) => (
            <tr key={d.rating}><td>{d.rating} estrellas</td><td>{d.count}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
