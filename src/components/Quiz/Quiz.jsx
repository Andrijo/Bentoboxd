import { useState } from "react"
import { generateQuestions } from "./quizQuestions.js"

const actionBtn = {
  background: "rgba(0,229,255,0.1)", border: "1px solid #00e5ff",
  color: "#00e5ff", padding: "10px 20px", cursor: "pointer",
  textTransform: "uppercase", fontFamily: "var(--font-mono)",
}

export default function Quiz({ movies, onBack }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selected, setSelected] = useState(null)
  const [questions, setQuestions] = useState(() => generateQuestions(movies))

  const restart = () => {
    setQuestions(generateQuestions(movies))
    setCurrentQ(0)
    setScore(0)
    setSelected(null)
    setShowResult(false)
  }

  const handleAnswer = (option) => {
    if (selected !== null) return
    setSelected(option)

    if (option === questions[currentQ].correct) {
      setScore((s) => s + 1)
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((c) => c + 1)
        setSelected(null)
      } else {
        setShowResult(true)
      }
    }, 1200)
  }

  if (questions.length === 0) {
    return (
      <section className="rd-page" aria-label="Quiz">
        <div className="rd-page-notice">
          No hay suficientes películas calificadas para armar un quiz.
        </div>
      </section>
    )
  }

  const current = questions[currentQ]

  return (
    <section className="rd-page" aria-label="Quiz">
      <div className="rd-quiz-card">
        {showResult ? (
          <div style={{ padding: "clamp(24px, 8vw, 50px)", textAlign: "center" }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 9vw, 3rem)",
              color: "#00e5ff", margin: 0,
            }}>
              TEST COMPLETADO
            </h2>
            <div style={{ fontSize: "var(--fs-base)", color: "#DBD5CA", margin: "20px 0" }}>
              Puntuación:{" "}
              <span style={{ color: "#facc15", fontWeight: "bold" }}>
                {score}
              </span>{" "}
              / {questions.length}
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={restart} type="button" style={actionBtn}>
                Jugar de nuevo
              </button>
              <button onClick={onBack} type="button" style={{
                ...actionBtn, background: "transparent",
                borderColor: "rgba(255,255,255,0.2)", color: "#DBD5CA",
              }}>
                Volver al perfil
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between",
              color: "#00e5ff", fontSize: "var(--fs-xs)",
            }}>
              <span>SYSTEM.TRIVIA_MODULE</span>
              <span>PREGUNTA {currentQ + 1} / {questions.length}</span>
            </div>

            <div style={{ padding: "clamp(20px, 6vw, 30px)" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{
                  fontSize: "var(--fs-md)", color: "#F0EDE5",
                  marginBottom: "20px", lineHeight: "1.4",
                }}>
                  {current.qText}
                </div>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                {current.options.map((opt) => {
                  let bgColor = "rgba(255,255,255,0.03)"
                  let borderColor = "rgba(255,255,255,0.1)"
                  let textColor = "#DBD5CA"

                  if (selected) {
                    if (opt === current.correct) {
                      bgColor = "rgba(74,222,128,0.15)"
                      borderColor = "#4ade80"
                      textColor = "#4ade80"
                    } else if (opt === selected && selected !== current.correct) {
                      bgColor = "rgba(255,68,68,0.15)"
                      borderColor = "#ff4444"
                      textColor = "#ff4444"
                    }
                  }

                  return (
                    <button
                      key={opt}
                      disabled={selected !== null}
                      onClick={() => handleAnswer(opt)}
                      type="button"
                      style={{
                        background: bgColor, border: `1px solid ${borderColor}`,
                        color: textColor, padding: "14px", borderRadius: "3px",
                        cursor: selected ? "default" : "pointer",
                        fontSize: "var(--fs-sm)", fontFamily: "var(--font-mono)",
                        transition: "background 0.2s, border-color 0.2s, color 0.2s",
                      }}>
                      {opt}{" "}
                      {opt !== "Sin calificar" && !current.isYear ? "⭐" : ""}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
