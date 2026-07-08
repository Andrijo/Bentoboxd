export default function SearchSection({ url, loading, onUrlChange, onFetch }) {
  return (
    <div
      style={{
        padding: "32px 40px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onFetch()}
        placeholder="letterboxd.com/username o solo el username"
        className="rd-search-input"
      />

      <button
        onClick={onFetch}
        disabled={loading}
        type="button"
        className="rd-search-btn"
        style={{
          background: loading
            ? "rgba(0,229,255,0.1)"
            : "rgba(0,229,255,0.12)",
          border: "1px solid rgba(0,229,255,0.4)",
          color: loading ? "rgba(0,229,255,0.4)" : "#00e5ff",
          cursor: loading ? "not-allowed" : "pointer",
        }}>
        {loading ? "Cargando..." : "Generar"}
      </button>
    </div>
  )
}
