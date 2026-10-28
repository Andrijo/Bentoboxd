// Aplica el tema guardado antes del primer pintado (sin parpadeo).
// Archivo aparte y no inline: así la CSP no necesita 'unsafe-inline' ni hashes.
try {
  var saved = localStorage.getItem("bentoboxd_theme:v1")
  var light = saved
    ? saved === "light"
    : window.matchMedia("(prefers-color-scheme: light)").matches
  if (light) {
    document.documentElement.dataset.theme = "light"
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#f6f4ee")
  }
} catch {
  // Sin almacenamiento disponible: queda el tema oscuro por defecto.
}
