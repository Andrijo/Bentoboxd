export default function SearchSection({ url, loading, onUrlChange, onFetch }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onFetch()
      }}
      style={{
        padding: "20px var(--gutter)",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        borderBottom: "1px solid rgb(var(--fg-rgb) / 0.04)",
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
        placeholder="letterboxd.com/tu-usuario o solo tu usuario"
        className="rd-search-input"
      />

      <button
        disabled={loading}
        type="submit"
        className="rd-search-btn rd-btn-solid">
        {loading ? "Cargando..." : "Generar"}
      </button>
    </form>
  )
}
