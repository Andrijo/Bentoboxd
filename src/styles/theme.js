export const colors = {
  background: "#0a0a0a",
  surface: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.07)",
  borderLight: "rgba(255,255,255,0.06)",
  borderInput: "rgba(255,255,255,0.1)",
  text: "#DBD5CA",
  textBright: "#F0EDE5",
  textDim: "rgba(255,255,255,0.3)",
  accent: "#00e5ff",
  accentGlow: "rgba(0,229,255,0.15)",
  error: "rgba(255,80,80,0.7)",
  errorBorder: "rgba(255,80,80,0.3)",
}

export const fonts = {
  display: "'Bebas Neue', sans-serif",
  mono: "'Space Mono', monospace",
}

export const panelStyle = {
  margin: "0 40px 40px",
  border: `1px solid ${colors.border}`,
  borderRadius: "4px",
  background: colors.surface,
  overflow: "hidden",
}

export const panelHeaderStyle = {
  padding: "16px 24px",
  borderBottom: `1px solid ${colors.borderLight}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
}

export const panelTitleStyle = {
  fontFamily: fonts.display,
  fontSize: "2rem",
  letterSpacing: "2px",
  color: colors.textBright,
  lineHeight: 1,
}

export const panelBodyStyle = {
  padding: "24px",
  minHeight: "200px",
}

export const toggleGroupStyle = {
  display: "flex",
  gap: "4px",
  background: "rgba(0,0,0,0.3)",
  borderRadius: "3px",
  padding: "3px",
  border: "1px solid rgba(255,255,255,0.07)",
}

export const loadingTextStyle = (color = colors.accent) => ({
  fontSize: "0.55rem",
  letterSpacing: "4px",
  color: `${color}80`,
  animation: "pulse 1.2s ease infinite",
  fontFamily: fonts.mono,
  textTransform: "uppercase",
})

export const emptyTextStyle = {
  textAlign: "center",
  fontSize: "0.55rem",
  color: colors.textDim,
  marginTop: "20px",
  fontFamily: fonts.mono,
}
