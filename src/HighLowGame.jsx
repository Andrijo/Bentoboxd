import { useState, useReducer, useEffect } from "react"
import { seededRandom, randomSeed } from "./utils/shuffle.js"
import { buildDeck, isCorrectGuess } from "./utils/highLowDeck.js"

const CAT_CONFIG = {
  rating: {
    unit: "Estrellas",
    desc: "Adivina si la siguiente película tiene una calificación mayor o menor.",
    sub: "Según la calificación media del público.",
  },
  popularity: {
    unit: "Popularidad",
    desc: "Adivina qué película es más popular hoy.",
    sub: "Según la actividad reciente del público; cambia día a día.",
  },
  year: {
    unit: "Estreno",
    desc: "Adivina qué película se estrenó más recientemente (Higher = más nueva).",
    sub: "Según la fecha de estreno oficial en cines.",
  },
}

// El índice de popularidad de TMDB llega con muchos decimales.
const formatMetric = (category, value) =>
  category === "popularity" ? Math.round(value * 10) / 10 : value

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
      return { ...initialGameState, deckSeed: action.seed }
    default:
      return state
  }
}

const cardStyle = {
  position: "relative",
  // En móvil el ancho manda para que ambas cartas quepan lado a lado.
  height: "min(46vh, 40vw)",
  maxHeight: "330px",
  aspectRatio: "2/3",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  border: "1px solid rgb(var(--fg-rgb) / 0.1)",
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
    "linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.7) 35%, transparent 60%)",
  pointerEvents: "none",
  zIndex: 1,
}
const labelStyle = {
  position: "absolute",
  bottom: 0,
  width: "100%",
  padding: "20px 10px",
  color: "#f6f4ee",
  fontFamily: "var(--font-display)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textShadow: "0px 4px 20px rgba(17,17,17,1), 0px 2px 5px rgba(17,17,17,1)",
  zIndex: 2,
}
// width 0 + minWidth 100%: el título toma el ancho de la carta sin
// ensancharla; hasta 2 líneas centradas antes de recortar con "…".
// minHeight reserva las 2 líneas para que ambas cartas queden alineadas.
const titleStyle = {
  color: "var(--c-text-bright)",
  marginTop: "15px",
  fontSize: "clamp(0.85rem, 3vw, 1.25rem)",
  fontWeight: "bold",
  lineHeight: 1.25,
  minHeight: "2.5em",
  width: 0,
  minWidth: "100%",
  textAlign: "center",
  overflowWrap: "break-word",
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
}
// Controles en un lienzo de 60×150 (ver .rd-hlg-controls): el círculo VS
// está en (30,75) con r=25 y la base de cada flecha es un arco concéntrico
// de r=35, así que ambas flechas abrazan el círculo con 10 de separación.
// La flecha de abajo es la misma figura girada 180°.
const ARROW_PATH = "M30 0 L55 50.51 A35 35 0 0 0 5 50.51 Z"

function GuessControls({ disabled, onGuess }) {
  return (
    <div className="rd-hlg-controls">
      <button
        onClick={() => onGuess("higher")}
        type="button"
        disabled={disabled}
        aria-label="Higher (mayor)"
        title="Higher (↑)"
        className="rd-hlg-arrow rd-hlg-arrow-up">
        <svg viewBox="0 0 60 50.51" aria-hidden="true">
          <path d={ARROW_PATH} />
        </svg>
      </button>

      <div className="rd-hlg-vs" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <mask id="rd-hlg-vs-mask">
            <rect width="100" height="100" fill="#fff" />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000">
              VS
            </text>
          </mask>
          <circle
            cx="50"
            cy="50"
            r="50"
            fill="#333333"
            mask="url(#rd-hlg-vs-mask)"
          />
        </svg>
      </div>

      <button
        onClick={() => onGuess("lower")}
        type="button"
        disabled={disabled}
        aria-label="Lower (menor)"
        title="Lower (↓)"
        className="rd-hlg-arrow rd-hlg-arrow-down">
        <svg viewBox="0 0 60 50.51" aria-hidden="true">
          <path d={ARROW_PATH} />
        </svg>
      </button>
    </div>
  )
}

function GameHeader({ category, streak, onCategoryChange }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        paddingBottom: "20px",
        borderBottom: "1px solid rgb(var(--fg-rgb) / 0.06)",
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: "20px" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-2xl)",
              fontWeight: "normal",
              letterSpacing: "2px",
              lineHeight: 1,
              color: "var(--c-text-bright)",
              marginBottom: "8px",
              marginTop: "-34px",
            }}>
            HIGHER OR LOWER
          </h2>
          <div
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--c-text-muted)",
              letterSpacing: "0.5px",
            }}>
            {CAT_CONFIG[category].desc}
            <br />
            <span
              style={{
                color: "var(--c-text)",
                transition: "color 0.3s",
              }}>
              {CAT_CONFIG[category].sub}
            </span>
          </div>
        </div>

        <div
          style={{
            color: "var(--c-text-bright)",
            fontSize: "clamp(1.1rem, 4vw, 1.8rem)",
            fontFamily: "var(--font-display)",
            letterSpacing: "2px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textAlign: "right",
          }}>
          Racha: {streak}
        </div>
      </div>

      <div
        role="group"
        className="rd-segmented"
        aria-label="Categoría"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}>
        {[
          { id: "rating", label: "Calificación" },
          { id: "popularity", label: "Popularidad" },
          { id: "year", label: "Año" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              onCategoryChange(cat.id)
            }}
            type="button"
            aria-pressed={category === cat.id}
            style={{
              background:
                category === cat.id
                  ? "var(--c-text-bright)"
                  : "rgb(var(--fg-rgb) / 0.05)",
              color:
                category === cat.id
                  ? "var(--c-on-text)"
                  : "var(--c-text-muted)",
              border:
                category === cat.id
                  ? "1px solid var(--c-text-bright)"
                  : "1px solid rgb(var(--fg-rgb) / 0.1)",
              padding: "8px clamp(12px, 4vw, 24px)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "var(--fs-xs)",
              fontFamily: "var(--font-mono)",
              transition:
                "background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s",
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
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "clamp(12px, 4vw, 40px)",
        padding: "20px 0",
      }}>
      {gameOver ? (
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 8vw, 2.5rem)",
              color: "var(--c-text-bright)",
              fontFamily: "var(--font-display)",
              marginBottom: "28px",
            }}>
            GAME OVER
          </h2>
          <button
            onClick={onRestart}
            type="button"
            style={{
              background: "var(--c-text-bright)",
              color: "var(--c-on-text)",
              padding: "10px 28px",
              border: "1px solid var(--c-text-bright)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "var(--fs-xs)",
              fontFamily: "var(--font-mono)",
            }}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center" }}>
            <div style={cardStyle}>
              <img
                src={movieA.poster}
                alt=""
                loading="lazy"
                decoding="async"
                style={imgStyle}
              />
              <div style={darkOverlayStyle} />

              <div style={labelStyle}>
                <div
                  style={{
                    fontSize: "clamp(2rem, 8vw, 2.75rem)",
                    lineHeight: 1,
                  }}>
                  {formatMetric(category, movieA.metrics[category])}
                </div>
                <div style={{ fontSize: "var(--fs-sm)", opacity: 0.9 }}>
                  {CAT_CONFIG[category].unit}
                </div>
              </div>
            </div>
            <div style={titleStyle} title={movieA.title}>
              {movieA.title}
            </div>
          </div>

          <GuessControls disabled={!!feedback} onGuess={onGuess} />

          <div style={{ textAlign: "center" }}>
            <div style={cardStyle}>
              <img
                src={movieB.poster}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  ...imgStyle,
                  filter: feedback
                    ? "blur(3px) brightness(0.4)"
                    : "brightness(1)",
                }}
              />
              <div style={darkOverlayStyle} />

              <div style={labelStyle}>
                <div
                  style={{
                    fontSize: "clamp(2rem, 8vw, 2.75rem)",
                    lineHeight: 1,
                  }}>
                  {feedback ? (
                    formatMetric(category, movieB.metrics[category])
                  ) : (
                    <>
                      <span aria-hidden="true">?</span>
                      <span className="rd-sr-only">Valor oculto</span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: "var(--fs-sm)", opacity: 0.9 }}>
                  {CAT_CONFIG[category].unit}
                </div>
              </div>

              {feedback && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(3rem, 13vw, 4.5rem)",
                    color: "#f6f4ee",
                    textShadow: "0 0 40px rgba(17,17,17,1)",
                  }}>
                  {feedback === "correct" ? "✓" : "✕"}
                </div>
              )}
            </div>
            <div style={titleStyle} title={movieB.title}>
              {movieB.title}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function HighLowGame({ movies, loading }) {
  const [category, setCategory] = useState("rating")
  // La semilla se sortea por partida: mismo orden en cada render, otro al reiniciar.
  const [state, dispatch] = useReducer(gameReducer, undefined, () => ({
    ...initialGameState,
    deckSeed: randomSeed(),
  }))

  const gameDeck = buildDeck(movies, category, seededRandom(state.deckSeed))

  const movieA = gameDeck[state.currentIndex]
  const movieB = gameDeck[state.currentIndex + 1]

  const handleGuess = (guess) => {
    if (state.feedback || state.gameOver) return

    const isCorrect = isCorrectGuess(
      guess,
      movieA.metrics[category],
      movieB.metrics[category],
    )

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
    dispatch({ type: "RESTART", seed: randomSeed() })
  }

  // Atajos: ↑ higher, ↓ lower.
  useEffect(() => {
    if (!movieA || !movieB) return
    const onKey = (e) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return
      // No secuestrar las flechas dentro de campos de texto.
      if (e.target.closest?.("input, textarea, select")) return
      e.preventDefault()
      handleGuess(e.key === "ArrowUp" ? "higher" : "lower")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // Las métricas vienen de TMDB; sin ellas no hay con qué comparar.
  const notice = loading
    ? "Cargando datos de las películas…"
    : "No hay suficientes películas con datos para esta categoría."

  return (
    <section className="rd-page rd-hlg" aria-label="Higher or Lower">
      <p className="rd-sr-only" role="status" aria-live="polite">
        {state.gameOver
          ? `Fin del juego. Racha final: ${state.streak}.`
          : state.feedback === "correct"
            ? `Correcto. ${movieB?.title}: ${formatMetric(category, movieB?.metrics[category])}. Racha: ${state.streak}.`
            : state.feedback === "wrong"
              ? `Incorrecto. ${movieB?.title}: ${formatMetric(category, movieB?.metrics[category])}.`
              : ""}
      </p>

      <GameHeader
        category={category}
        streak={state.streak}
        onCategoryChange={(id) => {
          setCategory(id)
          dispatch({ type: "RESTART", seed: randomSeed() })
        }}
      />

      {movieA && movieB ? (
        <GamePlayArea
          movieA={movieA}
          movieB={movieB}
          category={category}
          feedback={state.feedback}
          gameOver={state.gameOver}
          onGuess={handleGuess}
          onRestart={restart}
        />
      ) : (
        <div className="rd-page-notice" role="status">
          {notice}
        </div>
      )}
    </section>
  )
}
