import RecentProfiles from "./RecentProfiles.jsx"

export default function EmptyLanding({
  loading,
  movies,
  error,
  recentProfiles,
  onProfileSelect,
}) {
  if (loading || movies.length > 0) return null

  // Con error solo quedan los recientes: el aviso ya ocupa el lugar del mensaje.
  return (
    <div style={{ padding: "30px var(--gutter)", textAlign: "center" }}>
      {!error && (
        <>
          <div aria-hidden="true" style={{ fontSize: "4rem", marginBottom: "16px", opacity: 0.3 }}>
            🎞
          </div>
          <p
            style={{
              fontSize: "var(--fs-sm)",
              letterSpacing: "2px",
              color: "#E5E5E5",
              marginBottom: "20px",
            }}>
            Ingresa un usuario de Letterboxd para comenzar
          </p>
        </>
      )}

      <RecentProfiles profiles={recentProfiles} onSelect={onProfileSelect} />
    </div>
  )
}
