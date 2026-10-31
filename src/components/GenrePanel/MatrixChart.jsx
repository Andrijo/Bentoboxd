import { useState } from "react"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"
import { formatPercent } from "../../utils/formatters.js"

const mixAlpha = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

export default function MatrixChart({ genres, movieCount }) {
  const [hoveredGenre, setHoveredGenre] = useState(null)

  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )

  const blocks = []
  sortedGenres.forEach((genre) => {
    const count = genres[genre]
    for (let i = 0; i < count; i++) {
      blocks.push(genre)
    }
  })

  return (
    <div style={{
      width: "100%", maxWidth: "340px", display: "flex",
      flexDirection: "column", alignItems: "center", gap: "24px",
    }}>
      <ul className="rd-sr-only">
        {sortedGenres.map((genre) => (
          <li key={genre}>
            {genre}: {genres[genre]} ({formatPercent(genres[genre], movieCount)})
          </li>
        ))}
      </ul>

      <div aria-hidden="true" style={{
        display: "flex", flexWrap: "wrap", gap: "4px",
        justifyContent: "center", alignContent: "flex-start",
      }}>
        {blocks.map((genre, i) => {
          const cfg = GENRE_CONFIG[genre]
          const isHovered = hoveredGenre === genre
          const isDimmed = hoveredGenre !== null && !isHovered

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredGenre(genre)}
              onMouseLeave={() => setHoveredGenre(null)}
              onClick={() => setHoveredGenre((g) => (g === genre ? null : genre))}
              style={{
                width: "16px", height: "16px",
                background: isDimmed
                  ? "rgb(var(--fg-rgb) / 0.05)"
                  : `linear-gradient(135deg, ${mixAlpha(cfg.color, 56)}, ${mixAlpha(cfg.color, 25)})`,
                border: isDimmed
                  ? "1px solid rgb(var(--fg-rgb) / 0.05)"
                  : `1px solid ${mixAlpha(cfg.color, 50)}`,
                borderRadius: "2px",
                transition: "background 0.2s ease, border 0.2s ease",
                cursor: "crosshair",
                animation: "fadeSlideIn 0.3s ease both",
                animationDelay: `${i * 15}ms`,
              }}
            />
          )
        })}
      </div>

      <div aria-hidden="true" style={{
        height: "50px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {hoveredGenre ? (
          <>
            <div style={{
              fontSize: "var(--fs-md)", fontFamily: "var(--font-display)",
              color: "var(--c-text-bright)", letterSpacing: "2px",
            }}>
              {hoveredGenre}
            </div>
            <div style={{
              fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
              color: "var(--c-text-muted)",
            }}>
              {genres[hoveredGenre]} nodos detectados (
              {formatPercent(genres[hoveredGenre], movieCount)})
            </div>
          </>
        ) : (
          <div style={{
              fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)",
              color: "var(--c-text-muted)", letterSpacing: "2px",
          }}>
            [ Toca o pasa el cursor sobre un nodo ]
          </div>
        )}
      </div>
    </div>
  )
}
