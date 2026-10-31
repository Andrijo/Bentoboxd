import { useState } from "react"
import MovieDrilldown from "../MovieDrilldown.jsx"
import { getFlagUrl, countryName, formatMovieCount } from "../../utils/formatters.js"
import { moviesWith } from "../../utils/movieFilters.js"

export default function CountryDatalog({ countries, movies = [] }) {
  const [openCountry, setOpenCountry] = useState(null)
  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {topCountryCodes.map(([code, count], i) => {
        const flagUrl = getFlagUrl(code)
        const fullName = countryName(code)

        return (
          <div key={code} style={{
            animation: "fadeSlideIn 0.3s ease both", animationDelay: `${i * 60}ms`,
          }}>
            <button
              type="button"
              aria-expanded={openCountry === code}
              onClick={() => setOpenCountry((open) => (open === code ? null : code))}
              className="rd-drill-row"
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                background: "var(--c-inset-strong)", padding: "12px 20px",
                borderRadius: "var(--radius-md)",
              }}>
              <span style={{
                display: "block", width: "40px", height: "30px", flexShrink: 0, borderRadius: "2px",
                overflow: "hidden", background: "rgb(var(--fg-rgb) / 0.02)",
                border: "1px solid rgb(var(--fg-rgb) / 0.05)",
              }}>
                {flagUrl ? (
                  <img src={flagUrl} alt=""
                    loading="lazy" decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span aria-hidden="true" style={{
                    width: "100%", height: "100%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "var(--fs-sm)",
                  }}>
                    📍
                  </span>
                )}
              </span>

              <span className="rd-country-name">
                {fullName}
              </span>
              <span style={{
                fontSize: "var(--fs-xs)", color: "var(--c-text-muted)", fontFamily: "var(--font-mono)",
                letterSpacing: "1px", background: "rgb(var(--fg-rgb) / 0.05)",
                padding: "4px 8px", borderRadius: "var(--radius-sm)",
              }}>
                {formatMovieCount(count)}
              </span>
            </button>
            {openCountry === code && (
              <MovieDrilldown label={`Películas de ${fullName}`} movies={moviesWith(movies, "countries", code)} />
            )}
          </div>
        )
      })}
    </div>
  )
}
