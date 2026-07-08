import { useState } from "react"
import StarRating from "../StarRating.jsx"

const SIZES = {
  1: { gridColumn: "span 1", gridRow: "span 1" },
  2: { gridColumn: "span 2", gridRow: "span 1" },
  3: { gridColumn: "span 2", gridRow: "span 2" },
}

export default function MovieCard({ movie, size, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={movie.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...SIZES[size],
        position: "relative",
        overflow: "hidden",
        borderRadius: "4px",
        display: "block",
        textDecoration: "none",
        border: hovered
          ? "1px solid rgba(0,229,255,0.5)"
          : "1px solid rgba(255,255,255,0.06)",
        transition:
          "border 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "scale(1.015)" : "scale(1)",
        boxShadow: hovered ? "0 0 30px rgba(0,229,255,0.15)" : "none",
        animation: `fadeSlideIn 0.5s ease both`,
        animationDelay: `${index * 60}ms`,
        background: "#0a0a0a",
      }}>
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s ease, filter 0.3s ease",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            filter: hovered ? "brightness(0.45)" : "brightness(0.75)",
          }}
        />
      ) : (
        <div className="rd-no-poster">
          🎬
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.85) 25%, rgba(10,10,10,0.3) 55%, transparent 100%)",
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : size === 1 ? 0.9 : 0.7,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 3,
          padding: size === 3 ? "16px 14px" : "10px 10px",
          paddingBottom: hovered
            ? size === 3 ? "16px" : "10px"
            : size === 3 ? "14px" : "8px",
          transition: "padding-bottom 0.3s ease",
        }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: size === 3 ? "1.8rem" : size === 2 ? "1.25rem" : "1rem",
            color: "#F0EDE5",
            lineHeight: 1.1,
            letterSpacing: "0.5px",
            marginBottom: "3px",
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          }}>
          {movie.title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}>
          {movie.year && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'Space Mono', monospace",
              }}>
              {movie.year}
            </span>
          )}
          <StarRating rating={movie.rating} />
        </div>

        {hovered && size >= 2 && (
          <div
            style={{
              marginTop: "5px",
              fontSize: "0.75rem",
              color: "rgba(0,229,255,0.6)",
              fontFamily: "'Space Mono', monospace",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}>
            Ver en Letterboxd →
    </a>
        )}
      </div>

      <div className="rd-index-badge">
        {String(index + 1).padStart(2, "0")}
      </div>
    </div>
  )
}
