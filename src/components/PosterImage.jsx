import { useState } from "react"

/**
 * Póster con shimmer mientras carga y fade-in al terminar.
 * El contenedor debe tener `position: relative`.
 */
export default function PosterImage({ src, alt, style }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && (
        <div
          className="rd-skeleton"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, borderRadius: 0 }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: [style?.transition, "opacity 0.4s ease"]
            .filter(Boolean)
            .join(", "),
        }}
      />
    </>
  )
}
