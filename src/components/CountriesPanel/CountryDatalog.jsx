import { getFlagUrl, ISO_COUNTRY_NAMES } from "../../utils/formatters.js"

const themeColor = "#ff8c00"

export default function CountryDatalog({ countries }) {
  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {topCountryCodes.map(([code, count], i) => {
        const flagUrl = getFlagUrl(code)
        const fullName = ISO_COUNTRY_NAMES[code] || `Código: ${code}`

        return (
          <div key={code} style={{
            display: "flex", alignItems: "center", gap: "16px",
            background: "rgba(0,0,0,0.4)", padding: "12px 20px",
            borderRadius: "4px", borderLeft: `2px solid ${themeColor}`,
            animation: "fadeSlideIn 0.3s ease both", animationDelay: `${i * 60}ms`,
          }}>
            <div style={{
              width: "40px", height: "30px", flexShrink: 0, borderRadius: "2px",
              overflow: "hidden", background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              {flagUrl ? (
                <img src={flagUrl} alt={fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "100%", height: "100%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "0.8rem",
                }}>
                  📍
                </div>
              )}
            </div>

            <span style={{
              flex: 1, color: "#DBD5CA", fontSize: "0.85rem",
              textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {fullName}
            </span>
            <span style={{
              fontSize: "0.6rem", color: themeColor, fontFamily: "'Space Mono', monospace",
              letterSpacing: "1px", background: `${themeColor}15`,
              padding: "4px 8px", borderRadius: "2px",
            }}>
              {count} FILM{count !== 1 ? "S" : ""}
            </span>
          </div>
        )
      })}
    </div>
  )
}
