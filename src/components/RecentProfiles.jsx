export default function RecentProfiles({ profiles, onSelect }) {
  if (profiles.length === 0) return null

  return (
    <div style={{ marginTop: "40px", animation: "fadeSlideIn 0.8s ease both" }}>
      <h2
        id="rd-recent-title"
        style={{
          fontWeight: "inherit",
          fontSize: "var(--fs-2xs)",
          letterSpacing: "3px",
          color: "rgba(255,255,255,0.55)",
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
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            type="button"
            className="rd-profile-btn"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"
              e.currentTarget.style.background = "rgba(0,229,255,0.05)"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"
              e.currentTarget.style.background = "rgba(0,229,255,0.05)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
              e.currentTarget.style.background = "rgba(255,255,255,0.03)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
              e.currentTarget.style.background = "rgba(255,255,255,0.03)"
            }}>
            @{profile}
          </button>
        ))}
      </div>
    </div>
  )
}
