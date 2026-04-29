export default async function handler(req, res) {
  const { user } = req.query

  if (!user) {
    return res.status(400).json({ error: "Falta el parámetro user" })
  }

  try {
    const response = await fetch(`https://letterboxd.com/${user}/rss/`)
    
    if (!response.ok) {
      return res.status(response.status).json({ error: "Usuario no encontrado" })
    }

    const xml = await response.text()
    res.setHeader("Content-Type", "application/xml")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).send(xml)
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el feed" })
  }
}