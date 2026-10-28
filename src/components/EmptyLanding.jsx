import RecentProfiles from "./RecentProfiles.jsx"

// Perfil público de Letterboxd para probar la app sin tener cuenta.
export const EXAMPLE_PROFILE = "Andrijo"

const FEATURES = [
  "Géneros",
  "Directores",
  "Reparto",
  "Países",
  "Streaming",
  "Quiz",
  "Higher or Lower",
]

function FilmIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="40"
      height="40"
      fill="none"
      stroke="var(--c-accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.7, marginBottom: "12px" }}>
      <rect x="6" y="8" width="36" height="32" rx="3" />
      <path d="M14 8v32M34 8v32M6 18h8M6 30h8M34 18h8M34 30h8" />
    </svg>
  )
}

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
    <div className="rd-landing">
      {!error && (
        <>
          <FilmIcon />
          <h2 className="rd-landing-title">Tu Letterboxd, en un dashboard</h2>
          <p className="rd-landing-lead">
            Escribe un usuario y convierte sus últimas películas vistas en
            estadísticas, gráficos y minijuegos.
          </p>

          <ul className="rd-landing-features" aria-label="Qué incluye">
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <button
            type="button"
            className="rd-landing-example"
            onClick={() => onProfileSelect(EXAMPLE_PROFILE)}>
            Probar con @{EXAMPLE_PROFILE}
          </button>
        </>
      )}

      <RecentProfiles profiles={recentProfiles} onSelect={onProfileSelect} />
    </div>
  )
}
