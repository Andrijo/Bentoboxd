import { getFlagUrl, countryName } from "../../utils/formatters.js"

const themeColor = "#ff8c00"

export default function CountrySectors({ countries }) {
  const topCountryCodes = Object.entries(countries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const max = Math.max(...topCountryCodes.map((c) => c[1]), 1)

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px",
    }}>
      {topCountryCodes.map(([code, count], i) => {
        const pct = (count / max) * 100
        const flagUrl = getFlagUrl(code)
        const fullName = countryName(code)

        return (
          <div key={code} style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            padding: "16px", borderRadius: "var(--radius-md)", position: "relative", overflow: "hidden",
            animation: "fadeSlideIn 0.4s ease both", animationDelay: `${i * 50}ms`,
          }}>
            <div style={{
              position: "absolute", bottom: 0, left: 0, height: "3px",
              width: `${pct}%`, background: themeColor, boxShadow: `0 0 10px ${themeColor}`,
            }} />

            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "8px",
            }}>
              <div style={{
                fontSize: "var(--fs-lg)", fontFamily: "var(--font-display)",
                color: themeColor, lineHeight: 1,
              }}>
                {count}
              </div>
              <div style={{
                width: "30px", height: "20px", borderRadius: "2px",
                overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <img src={flagUrl} alt=""
                  loading="lazy" decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>

            <div style={{
              fontSize: "var(--fs-2xs)", color: "var(--c-text-muted)",
              marginTop: "4px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {fullName}
            </div>
          </div>
        )
      })}
    </div>
  )
}
