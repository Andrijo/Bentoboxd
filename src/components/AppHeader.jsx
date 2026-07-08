export default function AppHeader({ movies, onReset, onShowQuiz, onShowGame }) {
  const btnBase = {
    padding: "10px 20px",
    borderRadius: "3px",
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.5rem",
    letterSpacing: "2px",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "all 0.2s",
    width: "160px",
    textAlign: "center",
  }

  return (
    <div className="rd-header-bar">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)",
        }}
      />

      <h1
        onClick={onReset}
        className="rd-header-title"
        style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
        }}>
        BENTOBOXD
      </h1>

      {movies.length > 0 && (
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onShowQuiz}
            style={{
              ...btnBase,
              background: "rgba(0,229,255,0.05)",
              border: "1px solid rgba(0,229,255,0.3)",
              color: "#00e5ff",
            }}>
            Quiz
          </button>
          <button
            onClick={onShowGame}
            style={{
              ...btnBase,
              background: "rgba(250,204,21,0.05)",
              border: "1px solid rgba(250,204,21,0.3)",
              color: "#facc15",
            }}>
            High or Low
          </button>
        </div>
      )}
    </div>
  )
}
