import { Component } from "react"

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="rd-crash" role="alert">
        <h1 className="rd-crash-title">Algo salió mal</h1>
        <p>La página encontró un error inesperado. Recárgala para seguir.</p>
        <button
          type="button"
          className="rd-btn-solid rd-crash-btn"
          onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    )
  }
}
