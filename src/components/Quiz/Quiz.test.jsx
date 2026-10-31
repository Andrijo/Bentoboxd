import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Quiz from "./Quiz.jsx"

vi.mock("./quizQuestions.js", () => ({
  generateQuestions: () => [
    { qText: "¿Uno?", options: ["a", "b"], correct: "a" },
    { qText: "¿Dos?", options: ["a", "b"], correct: "b" },
  ],
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

  it("muestra un aviso mientras cargan los datos", () => {
    render(<Quiz movies={[]} loading onBack={() => {}} />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando")
  })
})
