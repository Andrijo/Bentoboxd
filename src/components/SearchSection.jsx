import { useRef, useState } from "react"

export default function SearchSection({ url, loading, onUrlChange, onFetch, onCancel }) {
  const [showHint, setShowHint] = useState(false)
  const inputRef = useRef(null)

  return (
    <form
      role="search"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!url.trim()) {
          setShowHint(true)
          inputRef.current?.focus()
          return
        }
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
        ref={inputRef}
        id="rd-profile-input"
        type="text"
        value={url}
        onChange={(e) => {
          setShowHint(false)
          onUrlChange(e.target.value)
        }}
        autoComplete="off"
        spellCheck={false}
        placeholder="letterboxd.com/tu-usuario o solo tu usuario"
        aria-invalid={showHint}
        aria-describedby={showHint ? "rd-profile-hint" : undefined}
        className="rd-search-input"
      />

      <button
        disabled={loading}
        type="submit"
        aria-busy={loading}
        className="rd-search-btn rd-btn-solid">
        {loading ? (
          <>
            <span className="rd-spinner" aria-hidden="true" />
            <span className="rd-sr-only">Cargando</span>
          </>
        ) : (
          "Generar"
        )}
      </button>

      {loading && (
        <button type="button" onClick={onCancel} className="rd-search-cancel">
          Cancelar
        </button>
      )}

      {showHint && (
        <p id="rd-profile-hint" role="alert" className="rd-search-hint">
          Escribe un usuario de Letterboxd o la URL de su perfil.
        </p>
      )}
    </form>
  )
}
