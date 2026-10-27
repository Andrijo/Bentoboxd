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
    <div style={{ padding: "30px var(--gutter)", textAlign: "center" }}>
      <div aria-hidden="true" style={{ fontSize: "4rem", marginBottom: "16px", opacity: 0.3 }}>
        🎞
      </div>
      <p
        style={{
          fontSize: "var(--fs-2xs)",
          letterSpacing: "3px",
          color: "#E5E5E5",
          marginBottom: "20px",
        }}>
        Ingresa un usuario de Letterboxd para comenzar
      </p>

      <RecentProfiles profiles={recentProfiles} onSelect={onProfileSelect} />
    </div>
  )
}
