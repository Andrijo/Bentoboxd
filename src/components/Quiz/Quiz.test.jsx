import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import Quiz from "./Quiz.jsx"
import { generateQuestions } from "./quizQuestions.js"
import { setLanguage } from "../../i18n/index.js"

vi.mock("./quizQuestions.js", () => ({
  UNRATED: "unrated",
  generateQuestions: vi.fn(() => [
    { text: () => "¿Uno?", options: ["a", "b"], correct: "a" },
    { text: () => "¿Dos?", options: ["a", "b"], correct: "b" },
  ]),
}))

describe("Quiz", () => {
  it("espera a que el usuario avance en lugar de pasar solo", () => {
    render(<Quiz movies={[]} onBack={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: /^a/ }))
    const next = screen.getByRole("button", { name: "Siguiente" })
    expect(next).toHaveFocus()
    expect(screen.getByText("¿Uno?")).toBeInTheDocument()

    fireEvent.click(next)
    expect(screen.getByText("¿Dos?")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /^b/ }))
    fireEvent.click(screen.getByRole("button", { name: "Ver resultado" }))
    expect(screen.getByRole("heading", { name: "Resultados" })).toBeInTheDocument()
  })

  it("muestra el repaso con la respuesta correcta de las falladas", () => {
    render(<Quiz movies={[]} onBack={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: /^a/ }))
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }))
    fireEvent.click(screen.getByRole("button", { name: /^a/ }))
    fireEvent.click(screen.getByRole("button", { name: "Ver resultado" }))

    const review = screen.getByRole("list", { name: "Repaso de respuestas" })
    expect(review).toHaveTextContent("¿Uno?")
    expect(review).toHaveTextContent("Tu respuesta: a")
    expect(review).toHaveTextContent("Correcta: b")
    expect(screen.getByText(/Puntuación/)).toHaveTextContent("1 / 2")
  })

  it("indica de qué perfil son las preguntas", () => {
    render(<Quiz movies={[]} username="ana" onBack={() => {}} />)
    expect(screen.getByText("Películas de @ana")).toBeInTheDocument()
  })

  it("muestra la opción sin nota en el idioma activo", () => {
    vi.mocked(generateQuestions).mockReturnValueOnce([
      { text: () => "¿Nota?", options: ["3", "unrated"], correct: "unrated" },
    ])
    render(<Quiz movies={[]} onBack={() => {}} />)

    expect(screen.getByRole("button", { name: "Sin calificar" })).toBeInTheDocument()
  })

  it("conserva la partida al cambiar de idioma", () => {
    vi.mocked(generateQuestions).mockReturnValueOnce([
      { text: (t) => t.quiz.questions.poster(), options: ["a", "unrated"], correct: "a" },
    ])
    render(<Quiz movies={[]} username="ana" onBack={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: /^a/ }))

    act(() => setLanguage("en"))

    expect(screen.getByText("Which film is this poster from?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Unrated" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "See result" })).toBeInTheDocument()
  })

  it("muestra un aviso mientras cargan los datos", () => {
    render(<Quiz movies={[]} loading onBack={() => {}} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando")
  })
})
