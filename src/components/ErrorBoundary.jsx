import { Component } from "react"
import { getMessages } from "../i18n/index.js"

export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    const { crash } = getMessages()

    return (
      <div className="rd-crash" role="alert">
        <h1 className="rd-crash-title">{crash.title}</h1>
        <p>{crash.message}</p>
        <button
          type="button"
          className="rd-btn-solid rd-crash-btn"
          onClick={() => window.location.reload()}>
          {crash.reload}
        </button>
      </div>
    )
  }
}
