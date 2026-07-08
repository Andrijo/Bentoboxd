export default function RecentProfiles({ profiles, onSelect }) {
  if (profiles.length === 0) return null

  return (
    <div style={{ marginTop: "40px", animation: "fadeSlideIn 0.8s ease both" }}>
      <div
        style={{
          fontSize: "0.55rem",
          letterSpacing: "3px",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}>
        Perfiles recientes
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {profiles.map((profile) => (
          <button
            key={profile}
            onClick={() => onSelect(profile)}
            className="rd-profile-btn"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"
              e.currentTarget.style.background = "rgba(0,229,255,0.05)"
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
