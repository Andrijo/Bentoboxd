import { useState, useRef, useEffect } from "react"
import PosterImage from "../PosterImage.jsx"
import { generateQuestions } from "./quizQuestions.js"

const UNRATED = "Sin calificar"

function resultMessage(score, total) {
  if (score === total) return "Conoces tu diario de memoria."
  if (score >= total / 2) return "Buena memoria cinéfila."
  return "Toca repasar el diario."
}

function QuizReview({ questions, answers }) {
  return (
    <ol className="rd-quiz-review" aria-label="Repaso de respuestas">
      {questions.map((q, i) => {
        const right = answers[i] === q.correct
        return (
          <li key={i}>
            {q.movie?.poster && (
              <img
                className="rd-quiz-review-poster"
                src={q.movie.poster}
                alt=""
                loading="lazy"
              />
            )}
            <div className="rd-quiz-review-text">
              <div>{q.qText}</div>
              <div className="rd-quiz-review-answer">
                Tu respuesta: {answers[i]}
              </div>
              {!right && <div>Correcta: {q.correct}</div>}
            </div>
            <span className="rd-quiz-review-mark" aria-hidden="true">
              {right ? "✓" : "✕"}
            </span>
            <span className="rd-sr-only">{right ? "Acertada" : "Fallada"}</span>
          </li>
        )
      })}
    </ol>
  )
}

function QuizRound({ movies, onBack }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [questions, setQuestions] = useState(() => generateQuestions(movies))
  const questionRef = useRef(null)
  const resultRef = useRef(null)
  const nextRef = useRef(null)
  const answeredRef = useRef(false)

  const selected = answers[currentQ] ?? null
  const score = answers.filter((a, i) => a === questions[i]?.correct).length

  // Al desactivarse las opciones el foco se pierde; se lleva a la nueva
  // pregunta o al resultado. Solo tras responder, no al entrar a la página.
  useEffect(() => {
    if (!answeredRef.current) return
    ;(showResult ? resultRef : questionRef).current?.focus()
  }, [currentQ, showResult])

  useEffect(() => {
    if (selected !== null) nextRef.current?.focus()
  }, [selected])

  const restart = () => {
    answeredRef.current = true
    setQuestions(generateQuestions(movies))
    setCurrentQ(0)
    setAnswers([])
    setShowResult(false)
  }

  const handleAnswer = (option) => {
    if (selected !== null) return
    answeredRef.current = true
    setAnswers((prev) => {
      const next = [...prev]
      next[currentQ] = option
      return next
    })
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ((c) => c + 1)
    else setShowResult(true)
  }

  if (questions.length === 0) {
    return (
      <section className="rd-page" aria-label="Quiz">
        <div className="rd-page-notice">
          No hay suficientes películas para armar un quiz.
        </div>
      </section>
    )
  }

  const current = questions[currentQ]
  const feedback =
    selected === null
      ? ""
      : selected === current.correct
        ? "Correcto."
        : `Incorrecto. La respuesta era ${current.correct}.`

  return (
    <section className="rd-page" aria-label="Quiz">
      <div className="rd-quiz">
        <div className="rd-quiz-head">
          <h2 className="rd-panel-title">QUIZ</h2>
          {!showResult && (
            <span className="rd-quiz-progress">
              Pregunta {currentQ + 1} / {questions.length}
            </span>
          )}
        </div>

        <div className="rd-quiz-card">
          <p className="rd-sr-only" role="status" aria-live="polite">
            {showResult
              ? `Quiz completado: ${score} de ${questions.length}`
              : feedback}
          </p>
          {showResult ? (
            <div className="rd-quiz-result">
              <h2
                ref={resultRef}
                tabIndex={-1}
                className="rd-quiz-result-title">
                Resultados
              </h2>
              <div className="rd-quiz-score">
                Puntuación: <strong>{score}</strong> / {questions.length}
                <div className="rd-quiz-message">
                  {resultMessage(score, questions.length)}
                </div>
              </div>
              <QuizReview questions={questions} answers={answers} />
              <div className="rd-quiz-actions">
                <button
                  onClick={restart}
                  type="button"
                  className="rd-btn-solid rd-quiz-btn">
                  Jugar de nuevo
                </button>
                <button
                  onClick={onBack}
                  type="button"
                  className="rd-btn-solid rd-quiz-btn">
                  Volver al perfil
                </button>
              </div>
            </div>
          ) : (
            <div className="rd-quiz-body">
              {current.type === "poster" && current.movie?.poster && (
                <div
                  className="rd-quiz-poster"
                  data-blurred={selected === null}>
                  <PosterImage
                    src={current.movie.poster}
                    alt="Póster de la película a adivinar"
                    style={{
                      transition: "filter 0.4s ease, transform 0.4s ease",
                    }}
                  />
                </div>
              )}
              <h2
                id="rd-quiz-question"
                ref={questionRef}
                tabIndex={-1}
                className="rd-quiz-question">
                {current.qText}
              </h2>

              <div
                role="group"
                aria-labelledby="rd-quiz-question"
                className="rd-quiz-options">
                {current.options.map((opt) => {
                  const state =
                    selected === null
                      ? undefined
                      : opt === current.correct
                        ? "correct"
                        : opt === selected
                          ? "wrong"
                          : undefined
                  const mark =
                    state === "correct" ? "✓ " : state === "wrong" ? "✕ " : ""

                  return (
                    <button
                      key={opt}
                      disabled={selected !== null}
                      onClick={() => handleAnswer(opt)}
                      type="button"
                      data-state={state}
                      className="rd-quiz-option">
                      {mark}
                      {opt}{" "}
                      {current.type === "rating" && opt !== UNRATED && (
                        <span role="img" aria-label="estrellas">
                          ★
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {selected !== null && (
                <div className="rd-quiz-actions">
                  <button
                    ref={nextRef}
                    onClick={handleNext}
                    type="button"
                    className="rd-btn-solid rd-quiz-btn">
                    {currentQ < questions.length - 1
                      ? "Siguiente"
                      : "Ver resultado"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Quiz({ movies, loading = false, onBack }) {
  if (loading) {
    return (
      <section className="rd-page" aria-label="Quiz">
        <div className="rd-page-notice" role="status">
          Cargando datos de las películas…
        </div>
      </section>
    )
  }
  return <QuizRound movies={movies} onBack={onBack} />
}
