export function extractPoster(description) {
  const match = description?.match(/<img[^>]+src="([^"]+)"/)
  return match ? match[1] : null
}

export function extractRating(description) {
  const match = description?.match(/Rated: ([★½]+)/)
  if (!match) return null
  const raw = match[1]
  const full = (raw.match(/★/g) || []).length
  const half = raw.includes("½") ? 0.5 : 0
  return full + half
}

export function extractTitle(description) {
  const match = description?.match(/<p><strong>([^<]+)<\/strong><br>/)
  return match ? match[1] : null
}
