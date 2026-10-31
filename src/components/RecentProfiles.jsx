export default function RecentProfiles({ profiles, onSelect, onRemove }) {
  if (profiles.length === 0) return null

  return (
    <div style={{ marginTop: "24px", animation: "fadeSlideIn 0.8s ease both" }}>
      <h2
        id="rd-recent-title"
        style={{
          fontWeight: "inherit",
          fontSize: "var(--fs-2xs)",
          letterSpacing: "3px",
          color: "var(--c-text-muted)",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}>
        Perfiles recientes
      </h2>
      <div
        role="group"
        aria-labelledby="rd-recent-title"
        style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        {profiles.map((profile) => (
          <span key={profile} className="rd-profile-chip">
            <button
              onClick={() => onSelect(profile)}
              type="button"
              className="rd-profile-btn">
              @{profile}
            </button>
            <button
              onClick={() => onRemove(profile)}
              type="button"
              aria-label={`Quitar @${profile} de recientes`}
              title="Quitar de recientes"
              className="rd-profile-remove">
              <span aria-hidden="true">✕</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
