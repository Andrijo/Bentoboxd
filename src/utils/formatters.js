export function getFlagUrl(code) {
  if (!code || code === "UNKNOWN") return null
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`
}

export const ISO_COUNTRY_NAMES = {
  US: "Estados Unidos",
  GB: "Reino Unido",
  JP: "Japón",
  KR: "Corea del Sur",
  MX: "México",
  FR: "Francia",
  ES: "España",
  IT: "Italia",
  DE: "Alemania",
  CA: "Canadá",
  IN: "India",
  AR: "Argentina",
  BR: "Brasil",
  AU: "Australia",
  CN: "China",
  RU: "Rusia",
  SE: "Suecia",
  DK: "Dinamarca",
  IE: "Irlanda",
  NZ: "Nueva Zelanda",
  PL: "Polonia",
}
