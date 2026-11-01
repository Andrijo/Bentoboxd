import { useState, useRef, useEffect } from "react"
import PosterImage from "../PosterImage.jsx"
import { generateQuestions, UNRATED } from "./quizQuestions.js"
import { useMessages } from "../../i18n/index.js"

function resultMessage({ quiz }, score, total) {
  if (score === total) return quiz.resultPerfect
  if (score >= total / 2) return quiz.resultGood
  return quiz.resultLow
}

const optionLabel = ({ common }, option) => (option === UNRATED ? common.unrated : option)

function QuizReview({ questions, answers }) {
  const t = useMessages()

  return (
    <ol className="rd-quiz-review" aria-label={t.quiz.review}>
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
              <div>{q.text(t)}</div>
              <div className="rd-quiz-review-answer">
                {t.quiz.yourAnswer(optionLabel(t, answers[i]))}
              </div>
              {!right && <div>{t.quiz.rightAnswer(optionLabel(t, q.correct))}</div>}
            </div>
            <span className="rd-quiz-review-mark" aria-hidden="true">
              {right ? "✓" : "✕"}
            </span>
            <span className="rd-sr-only">{right ? t.quiz.answeredRight : t.quiz.answeredWrong}</span>
          </li>
        )
      })}
    </ol>
  )
}

function QuizRound({ movies, username, onBack }) {
  const t = useMessages()
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
      <section className="rd-page" aria-label={t.header.tabs.quiz}>
        <div className="rd-page-notice">
          {t.quiz.notEnough}
        </div>
      </section>
    )
  }

  const current = questions[currentQ]
  const feedback =
    selected === null
      ? ""
      : selected === current.correct
        ? t.quiz.correct
        : t.quiz.incorrect(optionLabel(t, current.correct))

  return (
    <section className="rd-page" aria-label={t.header.tabs.quiz}>
      <div className="rd-quiz">
        <div className="rd-quiz-head">
          <div className="rd-quiz-heading">
            <h2 className="rd-panel-title">{t.quiz.title}</h2>
            <p className="rd-game-profile">{t.common.gameProfile(username)}</p>
          </div>
          {!showResult && (
            <span className="rd-quiz-progress">
              {t.quiz.progress(currentQ + 1, questions.length)}
            </span>
          )}
        </div>

        <div className="rd-quiz-card">
          <p className="rd-sr-only" role="status" aria-live="polite">
            {showResult
              ? t.quiz.completed(score, questions.length)
              : feedback}
          </p>
          {showResult ? (
            <div className="rd-quiz-result">
              <h2
                ref={resultRef}
                tabIndex={-1}
                className="rd-quiz-result-title">
                {t.quiz.results}
              </h2>
              <div className="rd-quiz-score">
                {t.quiz.score} <strong>{score}</strong> / {questions.length}
                <div className="rd-quiz-message">
                  {resultMessage(t, score, questions.length)}
                </div>
              </div>
              <QuizReview questions={questions} answers={answers} />
              <div className="rd-quiz-actions">
                <button
                  onClick={restart}
                  type="button"
                  className="rd-btn-solid rd-quiz-btn">
                  {t.common.playAgain}
                </button>
                <button
                  onClick={onBack}
                  type="button"
                  className="rd-btn-solid rd-quiz-btn">
                  {t.common.backToProfile}
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
                    alt={t.quiz.posterAlt}
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
                {current.text(t)}
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
                      {optionLabel(t, opt)}{" "}
                      {current.type === "rating" && opt !== UNRATED && (
                        <span role="img" aria-label={t.quiz.starsIcon}>
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
                      ? t.common.next
                      : t.common.seeResult}
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

export default function Quiz({ movies, username, loading = false, onBack }) {
  const t = useMessages()

  if (loading) {
    return (
      <section className="rd-page" aria-label={t.header.tabs.quiz}>
        <div className="rd-page-notice" role="status">
          {t.common.loadingMovieData}
        </div>
      </section>
    )
  }
  return <QuizRound movies={movies} username={username} onBack={onBack} />
}
