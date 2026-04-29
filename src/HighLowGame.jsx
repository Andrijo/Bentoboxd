import { useState, useEffect } from "react"

export default function HighLowGame({ movies, onClose }) {
  const [category, setCategory] = useState("rating")
  const [streak, setStreak] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [gameDeck, setGameDeck] = useState([]) // <-- Usamos estado en lugar de useMemo

  const CAT_CONFIG = {
    rating: {
      label: "PUNTUACIÓN",
      unit: "ESTRELLAS",
      color: "#00e5ff",
      title: "Aclamación Mundial",
      desc: "Adivina si la siguiente película tiene una calificación mayor o menor.",
      sub: "Basado en la puntuación promedio mundial de TMDB.",
    },
    popularity: {
      label: "POPULARIDAD",
      unit: "PUNTOS",
      color: "#e81cff",
      title: "Fiebre de Taquilla",
      desc: "Adivina qué película es o fue más popular.",
      sub: "Basado en el índice de tendencias actual de TMDB.",
    },
    year: {
      label: "AÑO",
      unit: "ESTRENO",
      color: "#4ade80",
      title: "Línea de Tiempo",
      desc: "Adivina qué película se estrenó más recientemente (Higher = Más Nueva).",
      sub: "Basado en la fecha de estreno oficial en cines.",
    },
  }

  // Función para bloquear el scroll del fondo mientras el juego está activo
  useEffect(() => {
    // Bloquea el scroll del body al abrir
    document.body.style.overflow = "hidden"

    // Lo restaura al cerrar
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Función para barajar la baraja de forma manual
  const shuffleDeck = (cat) => {
    const shuffled = [...movies]
      .filter((m) => m.metrics && m.metrics[cat] > 0)
      .sort(() => 0.5 - Math.random())
    setGameDeck(shuffled)
  }

  // Barajamos cuando cambian las películas o eliges una categoría nueva
  useEffect(() => {
    if (movies.length > 0) {
      shuffleDeck(category)
    }
  }, [movies, category])

  const movieA = gameDeck[currentIndex]
  const movieB = gameDeck[currentIndex + 1]

  const handleGuess = (guess) => {
    if (feedback || gameOver) return

    const valA = movieA.metrics[category]
    const valB = movieB.metrics[category]

    let isCorrect = false
    if (category === "year") {
      isCorrect =
        (guess === "higher" && valB >= valA) ||
        (guess === "lower" && valB < valA)
    } else {
      isCorrect =
        (guess === "higher" && valB >= valA) ||
        (guess === "lower" && valB < valA)
    }

    if (isCorrect) {
      setFeedback("correct")
      setStreak((s) => s + 1)
      setTimeout(() => {
        if (currentIndex + 2 < gameDeck.length) {
          setCurrentIndex((i) => i + 1)
          setFeedback(null)
        } else {
          setGameOver(true)
        }
      }, 1500)
    } else {
      setFeedback("wrong")
      setTimeout(() => setGameOver(true), 2000)
    }
  }

  const restart = (cat = category) => {
    setStreak(0)
    setCurrentIndex(0)
    setFeedback(null)
    setGameOver(false)
    shuffleDeck(cat) // Volvemos a barajar al reiniciar
  }

  if (!movieA || !movieB) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#181818",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Space Mono', monospace",
      }}>
      {/* HEADER: Contexto y Botones de Categoría */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          padding: "20px",
          scrollSnapAlign: "start",
          background: "linear-gradient(to bottom, #111315, #181818)",
          borderBottom: "1px solid rgba(57, 32, 32, 0.05)",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#888",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#fff")}
            onMouseLeave={(e) => (e.target.style.color = "#888")}>
            ✕ Salir
          </button>

          <div style={{ textAlign: "center", flex: 1, padding: "0 20px" }}>
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: "bold",
                color: "#F0EDE5",
                marginBottom: "4px",
              }}>
              Higher or Lower
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.5px",
              }}>
              {CAT_CONFIG[category].desc}
              <br />
              <span
                style={{
                  color: CAT_CONFIG[category].color,
                  transition: "color 0.3s",
                }}>
                {CAT_CONFIG[category].sub}
              </span>
            </div>
          </div>

          <div
            style={{
              color: "#f59e0b",
              fontSize: "1.8rem",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "2px",
              width: "100px",
              textAlign: "right",
            }}>
            STREAK: {streak}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {[
            { id: "rating", label: "RATING", icon: "⭐" },
            { id: "popularity", label: "POPULARIDAD", icon: "🔥" },
            { id: "year", label: "AÑO", icon: "📅" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id)
                restart(cat.id)
              }}
              style={{
                background:
                  category === cat.id
                    ? CAT_CONFIG[cat.id].color
                    : "rgba(255,255,255,0.05)",
                color: category === cat.id ? "#000" : "rgba(255,255,255,0.5)",
                border:
                  category === cat.id
                    ? `1px solid ${CAT_CONFIG[cat.id].color}`
                    : "1px solid rgba(255,255,255,0.1)",
                padding: "8px 24px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.7rem",
                fontFamily: "'Space Mono', monospace",
                transition: "all 0.3s",
                boxShadow:
                  category === cat.id
                    ? `0 0 15px ${CAT_CONFIG[cat.id].color}40`
                    : "none",
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DE JUEGO */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "4vw",
          padding: "20px",
        }}>
        {gameOver ? (
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontSize: "4rem",
                color: "#ff4444",
                fontFamily: "'Bebas Neue'",
              }}>
              GAME OVER
            </h2>
            <button
              onClick={restart}
              style={{
                background: "#facc15",
                color: "#000",
                padding: "15px 30px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}>
              REINTENTAR
            </button>
          </div>
        ) : (
          <>
            {/* PELÍCULA A */}
            <div style={{ textAlign: "center" }}>
              <div style={cardStyle}>
                <img src={movieA.poster} style={imgStyle} />
                <div style={darkOverlayStyle} />

                <div style={labelStyle(CAT_CONFIG[category].color)}>
                  <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>
                    {movieA.metrics[category]}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                    {CAT_CONFIG[category].unit}
                  </div>
                </div>
              </div>
              <div style={titleStyle}>{movieA.title}</div>
            </div>

            <div style={vsStyle}>VS</div>

            {/* PELÍCULA B */}
            <div style={{ textAlign: "center" }}>
              <div style={cardStyle}>
                <img
                  src={movieB.poster}
                  style={{
                    ...imgStyle,
                    filter: feedback
                      ? "blur(3px) brightness(0.4)"
                      : "brightness(1)",
                  }}
                />
                <div style={darkOverlayStyle} />

                <div style={labelStyle(CAT_CONFIG[category].color)}>
                  <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>
                    {feedback ? movieB.metrics[category] : "?"}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                    {CAT_CONFIG[category].unit}
                  </div>
                </div>

                {feedback && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "6rem",
                      color: feedback === "correct" ? "#4ade80" : "#ff4444",
                      textShadow: "0 0 40px rgba(0,0,0,1)",
                    }}>
                    {feedback === "correct" ? "✓" : "✕"}
                  </div>
                )}
              </div>
              <div style={titleStyle}>{movieB.title}</div>
            </div>

            {/* BOTONES LATERALES */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                opacity: feedback ? 0.3 : 1,
                pointerEvents: feedback ? "none" : "auto",
                transition: "opacity 0.3s",
              }}>
              <button
                onClick={() => handleGuess("higher")}
                style={guessBtn("#facc15", "#000")}>
                ▲ HIGHER
              </button>
              <button
                onClick={() => handleGuess("lower")}
                style={guessBtn("#22c55e", "#fff")}>
                ▼ LOWER
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Estilos Reutilizables Optimizados para Legibilidad
// ─────────────────────────────────────────────
const cardStyle = {
  position: "relative",
  height: "55vh",
  maxHeight: "400px",
  aspectRatio: "2/3",
  borderRadius: "4px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
}
const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "all 0.3s ease",
}
const darkOverlayStyle = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 35%, transparent 60%)",
  pointerEvents: "none",
  zIndex: 1,
}
const labelStyle = (color) => ({
  position: "absolute",
  bottom: 0,
  width: "100%",
  padding: "20px 10px",
  color: color,
  fontFamily: "'Bebas Neue', sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textShadow: "0px 4px 20px rgba(0,0,0,1), 0px 2px 5px rgba(0,0,0,1)",
  zIndex: 2,
})
const titleStyle = {
  color: "#ffffff",
  marginTop: "15px",
  fontSize: "1.1rem",
  fontWeight: "bold",
  maxWidth: "200px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
}
const vsStyle = {
  background: "#facc15",
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  color: "#000",
  boxShadow: "0 0 20px rgba(250,204,21,0.4)",
  fontFamily: "'Bebas Neue', sans-serif",
}
const guessBtn = (bg, col) => ({
  background: bg,
  color: col,
  border: "none",
  padding: "15px 25px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  width: "150px",
  boxShadow: `0 4px 15px ${bg}40`,
  transition: "transform 0.1s",
})
