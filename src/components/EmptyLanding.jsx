import RecentProfiles from "./RecentProfiles.jsx"

export default function EmptyLanding({
  loading,
  movies,
  error,
  recentProfiles,
  onProfileSelect,
}) {
  if (loading || movies.length > 0 || error) return null

  return (
    <div style={{ padding: "30px 40px", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", marginBottom: "16px", opacity: 0.3 }}>
        🎞
      </div>
      <div
        style={{
          fontSize: "0.6rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#E5E5E5",
          marginBottom: "20px",
        }}>
        Ingresa un usuario de Letterboxd para comenzar
      </div>

      <RecentProfiles profiles={recentProfiles} onSelect={onProfileSelect} />
    </div>
  )
}
