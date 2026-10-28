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
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            type="button"
            className="rd-profile-btn">
            @{profile}
          </button>
        ))}
      </div>
    </div>
  )
}
