const movieCount = (n) => `${n} película${n === 1 ? "" : "s"}`

const OPENS_IN_LETTERBOXD = "(se abre en Letterboxd en una pestaña nueva)"

export default {
  document: {
    title: "Bentoboxd — Tu Letterboxd en un dashboard",
    description:
      "Convierte tu diario de Letterboxd en un dashboard: géneros, directores, actores, países, streaming y juegos con tus películas recientes.",
    ogDescription:
      "Géneros, directores, reparto, países, streaming y juegos a partir de tus películas recientes en Letterboxd.",
    ogLocale: "es_MX",
  },

  common: {
    movieCount,
    movieWord: (n) => (n === 1 ? "película" : "películas"),
    movies: "Películas",
    rating: "Nota",
    unrated: "Sin calificar",
    liked: "Me gusta",
    stars: (rating) => `${rating} de 5 estrellas`,
    opensInLetterboxd: OPENS_IN_LETTERBOXD,
    opensInNewTab: "(se abre en una pestaña nueva)",
    loading: "Cargando…",
    retry: "Reintentar",
    howCalculated: "Cómo se calcula",
    backToProfile: "Volver al perfil",
    playAgain: "Jugar de nuevo",
    next: "Siguiente",
    seeResult: "Ver resultado",
    loadingMovieData: "Cargando datos de las películas…",
    moviesBy: (name) => `Películas de ${name}`,
    moviesFrom: (country) => `Películas de ${country}`,
    moviesWith: (name) => `Películas con ${name}`,
    moviesOn: (platform) => `Películas en ${platform}`,
    genres: "Géneros",
    directors: "Directores",
    gameProfile: (username) => `Películas de @${username}`,
  },

  genres: {
    horror: "Terror",
    action: "Acción",
    scienceFiction: "Ciencia Ficción",
    drama: "Drama",
    comedy: "Comedia",
    thriller: "Thriller",
    romance: "Romance",
    animation: "Animación",
    documentary: "Documental",
    adventure: "Aventura",
    crime: "Crimen",
    fantasy: "Fantasía",
    mystery: "Misterio",
    family: "Familiar",
    other: "Otro",
  },

  app: {
    skipToContent: "Saltar al contenido",
    profileTitle: (username) => `@${username} — Bentoboxd`,
  },

  crash: {
    title: "Algo salió mal",
    message: "La página encontró un error inesperado. Recárgala para seguir.",
    reload: "Recargar",
  },

  header: {
    home: "Bentoboxd, volver al inicio",
    sections: "Secciones",
    tabs: { profile: "Perfil", quiz: "Quiz", "higher-lower": "Higher or Lower" },
    toDarkLabel: "Cambiar a tema oscuro",
    toDarkTitle: "Tema oscuro",
    toLightLabel: "Cambiar a tema claro",
    toLightTitle: "Tema claro",
  },

  language: { switchLabel: "Switch to English", short: "EN" },

  footer: {
    title: "Créditos",
    dataFrom: "Datos de",
    and: "y",
    unofficial: "Proyecto no oficial, sin relación con Letterboxd.",
    tmdbNotice: "Este producto usa la API de TMDB, pero no está avalado ni certificado por TMDB.",
    tmdbLogo: "Logo de TMDB",
  },

  search: {
    label: "Usuario o URL de perfil de Letterboxd",
    clear: "Limpiar campo",
    placeholder: "letterboxd.com/tu-usuario o solo tu usuario",
    submit: "Generar",
    loading: "Cargando",
    cancel: "Cancelar",
    recents: "Recientes",
    hint: "Escribe un usuario de Letterboxd o la URL de su perfil.",
  },

  recents: {
    title: "Perfiles recientes",
    remove: (profile) => `Quitar @${profile} de recientes`,
    removeTitle: "Quitar de recientes",
  },

  landing: {
    title: "Tu Letterboxd, en un dashboard",
    lead: "Escribe un usuario y convierte sus últimas películas vistas en estadísticas, gráficos y minijuegos.",
    includes: "Qué incluye",
    features: ["Géneros", "Directores", "Reparto", "Países", "Streaming"],
    tryExample: (profile) => `Probar con @${profile}`,
  },

  feedErrors: {
    invalidUser: "Usuario inválido. Usa solo letras, números, guiones o guiones bajos.",
    offline: "Sin conexión. Revisa tu internet e inténtalo de nuevo.",
    notFound: (user) => `No encontramos a @${user} en Letterboxd. Revisa el nombre o que el perfil sea público.`,
    rateLimited: "Demasiadas búsquedas seguidas. Espera un minuto e inténtalo de nuevo.",
    upstream: "Letterboxd no responde en este momento. Inténtalo de nuevo en unos minutos.",
    empty: (user) => `No se encontraron películas en el diario público de @${user}.`,
    timeout: "Letterboxd tardó demasiado en responder. Inténtalo de nuevo.",
    unexpected: "Error inesperado",
  },

  tmdbError: "No pudimos cargar los datos de TMDB. Inténtalo de nuevo en unos minutos.",

  coverage: {
    base: (matched, total) => `Estadísticas basadas en ${matched} de ${movieCount(total)}`,
    failed: (base, failed) => `${base}: TMDB no respondió para ${failed}.`,
    missing: (base) => `${base}: el resto no aparece en TMDB.`,
  },

  overview: {
    copy: { idle: "Copiar enlace", copied: "Enlace copiado", failed: "No se pudo copiar" },
    verdict: {
      kinder: "Más alto que el público",
      harsher: "Más bajo que el público",
      same: "En línea con el público",
    },
    feedScope: (total) => (total === 1 ? "Última entrada" : `Últimas ${total} entradas`),
    timeWatching: "Tiempo viendo",
    addingRuntimes: "Sumando duraciones…",
    perMovie: (duration) => `${duration} por película`,
    versusAudience: "Frente al público (TMDB)",
    comparing: "Comparando…",
    versusHow:
      "Media de la nota del perfil menos la del público en cada película calificada. TMDB puntúa de 0 a 10: aquí se divide entre 2. Menos de 0.1 de diferencia cuenta como «en línea».",
    average: "Promedio",
    unratedCount: (n) => `${n} sin calificar`,
    ratedCount: (n) => `${movieCount(n)} calificadas`,
    perWeek: "Por semana",
    moviesInDays: (movies, days) => `${movieCount(movies)} en ${days} día${days === 1 ? "" : "s"}`,
  },

  headline: {
    aboutPerMonth: (n) => `Cerca de ${movieCount(n)} al mes`,
    perWeek: (n) => `${movieCount(n)} por semana`,
    almostPerWeek: (n) => `Casi ${movieCount(n)} por semana`,
    overPerWeek: (n) => `Más de ${movieCount(n)} por semana`,
    mostly: (genres) => `sobre todo ${genres}`,
    and: "y",
    genrePhrase: (key, label) =>
      ({ documentary: "documentales", family: "familiares" })[key] || `de ${label.toLowerCase()}`,
    tmdb: {
      kinder: "notas más altas que las del público",
      harsher: "notas más bajas que las del público",
      same: "notas parecidas a las del público",
    },
  },

  sections: {
    label: "Secciones del perfil",
    movies: "Películas",
    summary: "Resumen",
    monthly: "Evolución",
    genres: "Géneros",
    streaming: "Streaming",
    opinions: "Opiniones",
    directors: "Directores",
    cast: "Reparto",
    topRated: "Mejor calificados",
    countries: "Países",
  },

  movieViews: {
    label: "Vista de películas",
    options: { bento: "Bento", timeline: "Línea de tiempo", terminal: "Terminal" },
    filteredCount: (shown, total) => `${shown} de ${total} películas`,
    recentCount: (shown, total) =>
      `${shown < total ? `${shown} de ${total}` : shown} películas recientes`,
    noMatches: "Ninguna película coincide con estos filtros.",
    rewatched: "Vista otra vez",
    watchedOn: (date) => `Vista el ${date}`,
    showRecent: "Ver solo las recientes",
    showAll: (total) => `Ver todas (${total})`,
    loading: "Cargando películas…",
    viewOnLetterboxd: "Ver en Letterboxd →",
  },

  filters: {
    label: "Filtros de películas",
    release: "Estreno",
    allFeminine: "Todas",
    allMasculine: "Todos",
    clear: "Quitar filtros",
  },

  summary: {
    title: "RESUMEN",
    ofWatched: (percent) => `${percent}% de las vistas`,
    rewatches: "Vistas otra vez",
    mostActiveDay: "Día más activo",
    topDecade: "Década más vista",
    decade: (decade) => `${decade}s`,
    histogramCaption: (rating) => `Calificaciones · la más frecuente es ${rating}★`,
    histogramTable: "Películas por calificación",
    ratingColumn: "Calificación",
    starsRow: (rating) => `${rating} estrellas`,
  },

  monthly: {
    title: "EVOLUCIÓN MENSUAL",
    subtitle: "Según la fecha en que se vio cada película",
    firstMonthNote: (limit) =>
      `El primer mes puede estar incompleto: Letterboxd solo comparte las últimas ${limit} entradas.`,
    notEnough: "Hacen falta entradas fechadas en al menos 2 meses para ver la evolución",
    noRating: "sin nota",
    averageRating: (value) => `nota media ${value}`,
    averageLabel: "Nota media",
    perMonth: "Películas y nota media por mes",
  },

  genrePanel: {
    title: "TOP GÉNEROS",
    subtitle: (movies, genres) => `${movieCount(movies)} · ${genres} género${genres === 1 ? "" : "s"}`,
    chartType: "Tipo de gráfico",
    charts: { donut: "Dona", bar: "Barras", matrix: "Matriz", gauges: "Medidores" },
    loading: "Clasificando géneros…",
    empty: "Sin datos de géneros disponibles",
    donutLabel: "Gráfico de pastel de géneros",
    ofMovies: (percent) => `${percent} de las películas`,
    matrixDetail: (count, percent) => `${count} nodos detectados (${percent})`,
    matrixHint: "[ Toca o pasa el cursor sobre un nodo ]",
    ofMaximum: (percent) => `${percent}% del máximo`,
    byFrequency: "Géneros por frecuencia",
  },

  directorsPanel: {
    title: "TOP DIRECTORES",
    subtitle: "Con al menos 2 películas",
    viewLabel: "Vista de directores",
    views: { cards: "Lista", hologram: "Holograma" },
    loading: "Analizando directores…",
    noneRepeated: "Ningún director tiene al menos 2 películas en este perfil.",
    empty: "Sin datos de directores disponibles",
  },

  actorsPanel: {
    title: "TOP REPARTO",
    loading: "Explorando apariciones…",
    empty: "Sin datos de reparto disponibles",
  },

  countriesPanel: {
    title: "TOP PAÍSES",
    viewLabel: "Vista de países",
    views: { list: "Lista", nodes: "Sectores" },
    loading: "Rastreando países…",
    empty: "Sin datos de origen disponibles",
  },

  platformsPanel: {
    title: "STREAMING",
    subtitle: "Disponible por suscripción en México · Datos de JustWatch",
    clearFilter: "Quitar filtro",
    loading: "Buscando plataformas…",
    empty: "Ninguna de estas películas está en streaming por suscripción en México",
  },

  opinionsPanel: {
    title: "OPINIONES IMPOPULARES",
    subtitle: "Mayores diferencias con el público (TMDB)",
    loading: "Comparando con el público…",
    above: "Por encima del público",
    below: "Por debajo del público",
    compare: (profile, audience) => `Perfil ${profile} · Público ${audience}`,
    aligned:
      "Las calificaciones van en línea con las del público (TMDB): ninguna se aleja media estrella o más.",
    noRatings: "Este perfil aún no tiene calificaciones para comparar con las del público (TMDB).",
    how: "Nota del perfil menos la del público en cada película. TMDB puntúa de 0 a 10: aquí se divide entre 2. Se muestran hasta 3 películas por lado con al menos media estrella de diferencia.",
  },

  topRatedPanel: {
    title: "MEJOR CALIFICADOS",
    subtitle: "Promedio de calificaciones del perfil, con al menos 2 películas",
    loading: "Calculando los mejor calificados…",
    ratedMovies: (n) => `${movieCount(n)} calificadas`,
    empty: "Aún no hay un género o director con al menos 2 películas calificadas por ti",
  },

  quiz: {
    title: "QUIZ",
    notEnough: "No hay suficientes películas para armar un quiz.",
    progress: (current, total) => `Pregunta ${current} / ${total}`,
    completed: (score, total) => `Quiz completado: ${score} de ${total}`,
    correct: "Correcto.",
    incorrect: (answer) => `Incorrecto. La respuesta era ${answer}.`,
    results: "Resultados",
    score: "Puntuación:",
    resultPerfect: "Conoces este diario de memoria.",
    resultGood: "Buena memoria cinéfila.",
    resultLow: "Toca repasar el diario.",
    review: "Repaso de respuestas",
    yourAnswer: (answer) => `Tu respuesta: ${answer}`,
    rightAnswer: (answer) => `Correcta: ${answer}`,
    answeredRight: "Acertada",
    answeredWrong: "Fallada",
    posterAlt: "Póster de la película a adivinar",
    starsIcon: "estrellas",
    questions: {
      rating: (title) => `¿Qué calificación recibió "${title}" en este perfil?`,
      year: (title) => `¿En qué año se estrenó "${title}"?`,
      director: (title) => `¿Quién dirigió "${title}"?`,
      poster: () => "¿De qué película es este póster?",
    },
  },

  highLow: {
    label: "Higher or Lower",
    title: "HIGHER OR LOWER",
    category: "Categoría",
    categories: {
      rating: {
        label: "Nota",
        unit: "Nota del público",
        desc: "Adivina si la siguiente película tiene una nota mayor o menor.",
        sub: "Según el público (TMDB), de 0 a 5.",
      },
      popularity: {
        label: "Popularidad",
        desc: "Adivina qué película es más popular hoy.",
        sub: "Según la actividad reciente en TMDB; cambia día a día.",
      },
      year: {
        label: "Estreno",
        unit: "Estreno",
        desc: "Adivina qué película se estrenó más recientemente (Higher = más nueva).",
        sub: "Según la fecha de estreno oficial en cines.",
      },
    },
    more: "Más",
    less: "Menos",
    popular: "popular",
    popularityReveal: (title, verdict, rival) => `${title} es ${verdict} popular que ${rival}`,
    higherLabel: "Higher (mayor)",
    lowerLabel: "Lower (menor)",
    streak: (streak) => `Racha: ${streak}`,
    streakResetNote: "Cambiar de categoría reinicia la racha.",
    allCorrect: "¡HAS ACERTADO TODO!",
    gameOver: "JUEGO TERMINADO",
    finalStreak: (streak) => `Racha final: ${streak}`,
    hiddenValue: "Valor oculto",
    shortcuts: "Atajos: ↑ Higher · ↓ Lower",
    statusFinished: (won, streak) =>
      `${won ? "¡Has completado el juego!" : "Fin del juego"}. Racha final: ${streak}.`,
    statusCorrect: (reveal, streak) => `Correcto. ${reveal}. Racha: ${streak}.`,
    statusWrong: (reveal) => `Incorrecto. ${reveal}.`,
    notEnough: "No hay suficientes películas con datos para esta categoría.",
  },
}
