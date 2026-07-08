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
        style={{
          flex: 1,
          minWidth: "260px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "3px",
          padding: "12px 16px",
          color: "#E5E5E5",
          fontSize: "0.75rem",
          fontFamily: "'Space Mono', monospace",
          transition: "border 0.2s",
        }}
      />

      <button
        onClick={onFetch}
        disabled={loading}
        style={{
          background: loading
            ? "rgba(0,229,255,0.1)"
            : "rgba(0,229,255,0.12)",
          border: "1px solid rgba(0,229,255,0.4)",
          color: loading ? "rgba(0,229,255,0.4)" : "#00e5ff",
          padding: "12px 28px",
          borderRadius: "3px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "0.7rem",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: "2px",
          textTransform: "uppercase",
          transition: "all 0.2s",
          width: "160px",
          textAlign: "center",
        }}>
        {loading ? "Cargando..." : "Generar"}
      </button>
    </div>
  )
}
