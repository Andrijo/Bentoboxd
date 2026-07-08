import { useState } from "react"
import { GENRE_KEYS, GENRE_CONFIG } from "../../constants/genres.js"

export default function MatrixChart({ genres }) {
  const [hoveredGenre, setHoveredGenre] = useState(null)

  const sortedGenres = GENRE_KEYS.filter((k) => (genres[k] || 0) > 0).sort(
    (a, b) => genres[b] - genres[a],
  )
  const totalFilms = Object.values(genres).reduce((a, b) => a + b, 0)

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
      <div style={{
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
              style={{
                width: "16px", height: "16px",
                background: isDimmed
                  ? "rgba(255,255,255,0.05)"
                  : `linear-gradient(135deg, ${cfg.color}90, ${cfg.color}40)`,
                border: isDimmed
                  ? "1px solid rgba(255,255,255,0.05)"
                  : `1px solid ${cfg.color}80`,
                borderRadius: "2px",
                boxShadow: isHovered
                  ? `0 0 10px ${cfg.glow}, 0 0 20px ${cfg.glow}`
                  : isDimmed ? "none" : `0 0 4px ${cfg.glow}`,
                transition: "all 0.2s ease",
                cursor: "crosshair",
                animation: "fadeSlideIn 0.3s ease both",
                animationDelay: `${i * 15}ms`,
              }}
            />
          )
        })}
      </div>

      <div style={{
        height: "50px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {hoveredGenre ? (
          <>
            <div style={{
              fontSize: "1.2rem", fontFamily: "'Bebas Neue', sans-serif",
              color: GENRE_CONFIG[hoveredGenre].color, letterSpacing: "2px",
            }}>
              {GENRE_CONFIG[hoveredGenre].icon} {hoveredGenre}
            </div>
            <div style={{
              fontSize: "0.75rem", fontFamily: "'Space Mono', monospace",
              color: "rgba(255,255,255,0.5)",
            }}>
              {genres[hoveredGenre]} NODOS DETECTADOS (
              {((genres[hoveredGenre] / totalFilms) * 100).toFixed(1)}%)
            </div>
          </>
        ) : (
          <div style={{
              fontSize: "0.75rem", fontFamily: "'Space Mono', monospace",
              color: "rgba(255,255,255,0.2)", letterSpacing: "2px",
          }}>
            [ PASE EL CURSOR PARA ANALIZAR NODOS ]
          </div>
        )}
      </div>
    </div>
  )
}
