export default function SearchSection({ url, loading, onUrlChange, onFetch }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onFetch()
      }}
      style={{
        padding: "32px var(--gutter)",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
      <label htmlFor="rd-profile-input" className="rd-sr-only">
        Usuario o URL de perfil de Letterboxd
      </label>
      <input
        id="rd-profile-input"
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder="letterboxd.com/username o solo el username"
        className="rd-search-input"
      />

      <button
        disabled={loading}
        type="submit"
        className="rd-search-btn"
        style={{
          background: loading
            ? "rgba(0,229,255,0.1)"
            : "rgba(0,229,255,0.12)",
          border: "1px solid rgba(0,229,255,0.4)",
          color: loading ? "rgba(0,229,255,0.4)" : "var(--c-accent)",
          cursor: loading ? "not-allowed" : "pointer",
        }}>
        {loading ? "Cargando..." : "Generar"}
      </button>
    </form>
  )
}
