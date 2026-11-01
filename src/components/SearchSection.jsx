import { useRef, useState } from "react"
import RecentProfiles from "./RecentProfiles.jsx"
import { useMessages } from "../i18n/index.js"

export default function SearchSection({
  url,
  loading,
  compact = false,
  recentProfiles = [],
  onUrlChange,
  onFetch,
  onCancel,
  onProfileSelect,
  onProfileRemove,
}) {
  const t = useMessages()
  const [showHint, setShowHint] = useState(false)
  const [showRecents, setShowRecents] = useState(false)
  const inputRef = useRef(null)
  // Sin perfil cargado, la landing ya muestra los recientes.
  const hasRecents = compact && recentProfiles.length > 0

  // El valor también cambia desde fuera (perfiles recientes, enlace, ejemplo).
  if (showHint && url.trim()) setShowHint(false)

  return (
    <form
      role="search"
      noValidate
      className="rd-search-form"
      data-compact={compact ? "" : undefined}
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
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        borderBottom: "1px solid rgb(var(--fg-rgb) / 0.04)",
      }}>
      <label htmlFor="rd-profile-input" className="rd-sr-only">
        {t.search.label}
      </label>
      <div className="rd-search-field">
        <input
          ref={inputRef}
          id="rd-profile-input"
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder={t.search.placeholder}
          aria-invalid={showHint}
          aria-describedby={showHint ? "rd-profile-hint" : undefined}
          className="rd-search-input"
        />
        {url && !loading && (
          <button
            type="button"
            aria-label={t.search.clear}
            title={t.search.clear}
            className="rd-search-clear"
            onClick={() => {
              onUrlChange("")
              inputRef.current?.focus()
            }}>
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <button
        disabled={loading}
        type="submit"
        aria-busy={loading}
        className="rd-search-btn rd-btn-solid">
        {loading ? (
          <>
            <span className="rd-spinner" aria-hidden="true" />
            <span className="rd-sr-only">{t.search.loading}</span>
          </>
        ) : (
          t.search.submit
        )}
      </button>

      {loading && (
        <button type="button" onClick={onCancel} className="rd-search-cancel">
          {t.search.cancel}
        </button>
      )}

      {hasRecents && (
        <button
          type="button"
          aria-expanded={showRecents}
          className="rd-btn-outline"
          onClick={() => setShowRecents((open) => !open)}>
          {t.search.recents}
        </button>
      )}

      {showHint && (
        <p id="rd-profile-hint" role="alert" className="rd-search-hint">
          {t.search.hint}
        </p>
      )}

      {hasRecents && showRecents && (
        <div className="rd-search-recents">
          <RecentProfiles
            profiles={recentProfiles}
            onSelect={(profile) => {
              setShowRecents(false)
              onProfileSelect(profile)
            }}
            onRemove={onProfileRemove}
          />
        </div>
      )}
    </form>
  )
}
