import { useState, useReducer } from "react"

function shuffleArray(arr, seed) {
  const shuffled = [...arr]
  let s = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = Math.floor(((s - 1) / 2147483646) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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

const initialGameState = {
  streak: 0,
  currentIndex: 0,
  feedback: null,
  gameOver: false,
  deckSeed: 0,
}

function gameReducer(state, action) {
  switch (action.type) {
    case "CORRECT":
      return { ...state, streak: state.streak + 1, feedback: "correct" }
    case "WRONG":
      return { ...state, feedback: "wrong" }
    case "NEXT_CARD":
      return { ...state, currentIndex: state.currentIndex + 1, feedback: null }
    case "GAME_OVER":
      return { ...state, gameOver: true }
    case "RESTART":
      return { ...initialGameState, deckSeed: state.deckSeed + 1 }
    default:
      return state
  }
}

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

function GameHeader({ category, streak, onClose, onCategoryChange }) {
  return (
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
          type="button"
          className="rd-hlg-close-btn"
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
              onCategoryChange(cat.id)
            }}
            type="button"
            style={{
              background:
                category === cat.id
                  ? CAT_CONFIG[cat.id].color
                  : "rgba(255,255,255,0.05)",
              color:
                category === cat.id ? "#000" : "rgba(255,255,255,0.5)",
              border:
                category === cat.id
                  ? `1px solid ${CAT_CONFIG[cat.id].color}`
                  : "1px solid rgba(255,255,255,0.1)",
              padding: "8px 24px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.75rem",
              fontFamily: "'Space Mono', monospace",
              transition: "background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s",
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
  )
}

function GamePlayArea({
  movieA,
  movieB,
  category,
  feedback,
  gameOver,
  onGuess,
  onRestart,
}) {
  return (
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
            onClick={onRestart}
            type="button"
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
          <div style={{ textAlign: "center" }}>
            <div style={cardStyle}>
              <img src={movieA.poster} alt={movieA.title} style={imgStyle} />
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

          <div style={{ textAlign: "center" }}>
            <div style={cardStyle}>
              <img
                src={movieB.poster}
                alt={movieB.title}
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
                    color:
                      feedback === "correct" ? "#4ade80" : "#ff4444",
                    textShadow: "0 0 40px rgba(0,0,0,1)",
                  }}>
                  {feedback === "correct" ? "✓" : "✕"}
                </div>
              )}
            </div>
            <div style={titleStyle}>{movieB.title}</div>
          </div>

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
              onClick={() => onGuess("higher")}
              type="button"
              style={guessBtn("#facc15", "#000")}>
              ▲ HIGHER
            </button>
            <button
              onClick={() => onGuess("lower")}
              type="button"
              style={guessBtn("#22c55e", "#fff")}>
              ▼ LOWER
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function HighLowGame({ movies, onClose }) {
  const [category, setCategory] = useState("rating")
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  const eligible = movies.filter(
    (m) => m.metrics && m.metrics[category] > 0,
  )
  const gameDeck = shuffleArray(eligible, state.deckSeed)

  const movieA = gameDeck[state.currentIndex]
  const movieB = gameDeck[state.currentIndex + 1]

  const handleGuess = (guess) => {
    if (state.feedback || state.gameOver) return

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
      dispatch({ type: "CORRECT" })
      setTimeout(() => {
        if (state.currentIndex + 2 < gameDeck.length) {
          dispatch({ type: "NEXT_CARD" })
        } else {
          dispatch({ type: "GAME_OVER" })
        }
      }, 1500)
    } else {
      dispatch({ type: "WRONG" })
      setTimeout(() => dispatch({ type: "GAME_OVER" }), 2000)
    }
  }

  const restart = () => {
    dispatch({ type: "RESTART" })
  }

  if (!movieA || !movieB) return null

  return (
    <div className="rd-hlg-container">
      <GameHeader
        category={category}
        streak={state.streak}
        onClose={onClose}
        onCategoryChange={(id) => {
          setCategory(id)
          dispatch({ type: "RESTART" })
        }}
      />

      <GamePlayArea
        movieA={movieA}
        movieB={movieB}
        category={category}
        feedback={state.feedback}
        gameOver={state.gameOver}
        onGuess={handleGuess}
        onRestart={restart}
      />
    </div>
  )
}
