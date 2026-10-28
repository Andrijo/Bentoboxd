import { useState } from "react"
import StarRating from "../StarRating.jsx"
import PosterImage from "../PosterImage.jsx"
import { TILE_SPANS } from "./bentoPatterns.js"

export default function MovieCard({ movie, size, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={movie.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="rd-movie-card rd-keep-dark"
      style={{
        ...TILE_SPANS[size],
        border: hovered
          ? "1px solid rgb(var(--accent-rgb) / 0.5)"
          : "1px solid rgb(var(--fg-rgb) / 0.06)",
        transition:
          "border 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "scale(1.015)" : "scale(1)",
        boxShadow: hovered ? "0 0 30px rgb(var(--accent-rgb) / 0.15)" : "none",
        animation: `fadeSlideIn 0.5s ease both`,
        animationDelay: `${index * 60}ms`,
      }}>
      {movie.poster ? (
        <PosterImage
          src={movie.poster}
          alt=""
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
        <div className="rd-no-poster" aria-hidden="true">🎬</div>
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
            ? size === 3
              ? "16px"
              : "10px"
            : size === 3
              ? "14px"
              : "8px",
        }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: size === 3 ? "var(--fs-xl)" : size === 1 ? "var(--fs-base)" : "var(--fs-md)",
            color: "var(--c-text-bright)",
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
                fontSize: "var(--fs-xs)",
                color: "var(--c-text-muted)",
                fontFamily: "var(--font-mono)",
              }}>
              {movie.year}
            </span>
          )}
          <StarRating rating={movie.rating} />
        </div>

        <span className="rd-sr-only">(se abre en Letterboxd en una pestaña nueva)</span>

        {hovered && size >= 2 && (
          <div
            aria-hidden="true"
            style={{
              marginTop: "5px",
              fontSize: "var(--fs-xs)",
              color: "rgb(var(--accent-rgb) / 0.6)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "1px",
            }}>
            Ver en Letterboxd →
          </div>
        )}
      </div>

      <div className="rd-index-badge" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
    </a>
  )
}
