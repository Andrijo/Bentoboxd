const movieCount = (n) => `${n} film${n === 1 ? "" : "s"}`

const OPENS_IN_LETTERBOXD = "(opens on Letterboxd in a new tab)"

export default {
  document: {
    title: "Bentoboxd — Your Letterboxd as a dashboard",
    description:
      "Turn your Letterboxd diary into a dashboard: genres, directors, actors, countries, streaming and games built from your recent films.",
    ogDescription:
      "Genres, directors, cast, countries, streaming and games from your recent films on Letterboxd.",
    ogLocale: "en_US",
  },

  common: {
    movieCount,
    movieWord: (n) => (n === 1 ? "film" : "films"),
    movies: "Films",
    rating: "Rating",
    unrated: "Unrated",
    liked: "Liked",
    stars: (rating) => `${rating} out of 5 stars`,
    opensInLetterboxd: OPENS_IN_LETTERBOXD,
    opensInNewTab: "(opens in a new tab)",
    loading: "Loading…",
    retry: "Retry",
    howCalculated: "How it's calculated",
    backToProfile: "Back to profile",
    playAgain: "Play again",
    next: "Next",
    seeResult: "See result",
    loadingMovieData: "Loading film data…",
    moviesBy: (name) => `${name} films`,
    moviesFrom: (country) => `Films from ${country}`,
    moviesWith: (name) => `Films with ${name}`,
    moviesOn: (platform) => `Films on ${platform}`,
    genres: "Genres",
    directors: "Directors",
    gameProfile: (username) => `Films from @${username}`,
  },

  genres: {
    horror: "Horror",
    action: "Action",
    scienceFiction: "Science Fiction",
    drama: "Drama",
    comedy: "Comedy",
    thriller: "Thriller",
    romance: "Romance",
    animation: "Animation",
    documentary: "Documentary",
    adventure: "Adventure",
    crime: "Crime",
    fantasy: "Fantasy",
    mystery: "Mystery",
    family: "Family",
    other: "Other",
  },

  app: {
    skipToContent: "Skip to content",
    profileTitle: (username) => `@${username} — Bentoboxd`,
  },

  crash: {
    title: "Something went wrong",
    message: "The page hit an unexpected error. Reload it to continue.",
    reload: "Reload",
  },

  header: {
    home: "Bentoboxd, back to start",
    sections: "Sections",
    tabs: { profile: "Profile", quiz: "Quiz", "higher-lower": "Higher or Lower" },
    toDarkLabel: "Switch to dark theme",
    toDarkTitle: "Dark theme",
    toLightLabel: "Switch to light theme",
    toLightTitle: "Light theme",
  },

  language: { switchLabel: "Cambiar a español", short: "ES" },

  footer: {
    title: "Credits",
    dataFrom: "Data from",
    and: "and",
    unofficial: "Unofficial project, not affiliated with Letterboxd.",
    tmdbNotice: "This product uses the TMDB API but is not endorsed or certified by TMDB.",
    tmdbLogo: "TMDB logo",
  },

  search: {
    label: "Letterboxd username or profile URL",
    clear: "Clear field",
    placeholder: "letterboxd.com/your-username or just your username",
    submit: "Generate",
    loading: "Loading",
    cancel: "Cancel",
    recents: "Recent",
    hint: "Enter a Letterboxd username or profile URL.",
  },

  recents: {
    title: "Recent profiles",
    remove: (profile) => `Remove @${profile} from recent`,
    removeTitle: "Remove from recent",
  },

  landing: {
    title: "Your Letterboxd, as a dashboard",
    lead: "Enter a username and turn their latest watched films into stats, charts and mini-games.",
    includes: "What's included",
    features: ["Genres", "Directors", "Cast", "Countries", "Streaming"],
    tryExample: (profile) => `Try @${profile}`,
  },

  feedErrors: {
    invalidUser: "Invalid username. Use only letters, numbers, hyphens or underscores.",
    offline: "No connection. Check your internet and try again.",
    notFound: (user) => `We couldn't find @${user} on Letterboxd. Check the name and that the profile is public.`,
    rateLimited: "Too many searches in a row. Wait a minute and try again.",
    upstream: "Letterboxd isn't responding right now. Try again in a few minutes.",
    empty: (user) => `No films found in @${user}'s public diary.`,
    timeout: "Letterboxd took too long to respond. Try again.",
    unexpected: "Unexpected error",
  },

  tmdbError: "We couldn't load the TMDB data. Try again in a few minutes.",

  coverage: {
    base: (matched, total) => `Stats based on ${matched} of ${movieCount(total)}`,
    failed: (base, failed) => `${base}: TMDB didn't respond for ${failed}.`,
    missing: (base) => `${base}: the rest aren't on TMDB.`,
  },

  overview: {
    copy: { idle: "Copy link", copied: "Link copied", failed: "Couldn't copy" },
    verdict: {
      kinder: "Higher than the audience",
      harsher: "Lower than the audience",
      same: "In line with the audience",
    },
    feedScope: (total) => (total === 1 ? "Latest entry" : `Latest ${total} entries`),
    timeWatching: "Time watching",
    addingRuntimes: "Adding up runtimes…",
    perMovie: (duration) => `${duration} per film`,
    versusAudience: "Versus the audience (TMDB)",
    comparing: "Comparing…",
    versusHow:
      "Average of the profile's rating minus the audience's on each rated film. TMDB scores from 0 to 10, so it's divided by 2 here. A difference under 0.1 counts as “in line”.",
    average: "Average",
    unratedCount: (n) => `${n} unrated`,
    ratedCount: (n) => `${movieCount(n)} rated`,
    perWeek: "Per week",
    moviesInDays: (movies, days) => `${movieCount(movies)} in ${days} day${days === 1 ? "" : "s"}`,
  },

  headline: {
    aboutPerMonth: (n) => `About ${movieCount(n)} a month`,
    perWeek: (n) => `${movieCount(n)} a week`,
    almostPerWeek: (n) => `Almost ${movieCount(n)} a week`,
    overPerWeek: (n) => `Over ${movieCount(n)} a week`,
    mostly: (genres) => `mostly ${genres}`,
    and: "and",
    genrePhrase: (key, label) =>
      ({ documentary: "documentaries", family: "family films" })[key] || label.toLowerCase(),
    tmdb: {
      kinder: "ratings higher than the audience's",
      harsher: "ratings lower than the audience's",
      same: "ratings close to the audience's",
    },
  },

  sections: {
    label: "Profile sections",
    movies: "Films",
    summary: "Summary",
    monthly: "Over time",
    genres: "Genres",
    streaming: "Streaming",
    opinions: "Opinions",
    directors: "Directors",
    cast: "Cast",
    topRated: "Top rated",
    countries: "Countries",
  },

  movieViews: {
    label: "Film view",
    options: { bento: "Bento", timeline: "Timeline", terminal: "Terminal" },
    filteredCount: (shown, total) => `${shown} of ${total} films`,
    recentCount: (shown, total) => `${shown < total ? `${shown} of ${total}` : shown} recent films`,
    noMatches: "No films match these filters.",
    rewatched: "Rewatched",
    watchedOn: (date) => `Watched on ${date}`,
    showRecent: "Show recent only",
    showAll: (total) => `Show all (${total})`,
    loading: "Loading films…",
    viewOnLetterboxd: "View on Letterboxd →",
  },

  filters: {
    label: "Film filters",
    release: "Release",
    allFeminine: "All",
    allMasculine: "All",
    clear: "Clear filters",
  },

  summary: {
    title: "SUMMARY",
    ofWatched: (percent) => `${percent}% of entries`,
    rewatches: "Rewatches",
    mostActiveDay: "Most active day",
    topDecade: "Most watched decade",
    decade: (decade) => `${decade}s`,
    histogramCaption: (rating) => `Ratings · the most frequent is ${rating}★`,
    histogramTable: "Films by rating",
    ratingColumn: "Rating",
    starsRow: (rating) => `${rating} stars`,
  },

  monthly: {
    title: "MONTHLY TREND",
    subtitle: "Based on the date each film was watched",
    firstMonthNote: (limit) =>
      `The first month may be incomplete: Letterboxd only shares the latest ${limit} entries.`,
    notEnough: "Dated entries in at least 2 months are needed to show the trend",
    noRating: "no rating",
    averageRating: (value) => `average rating ${value}`,
    averageLabel: "Average rating",
    perMonth: "Films and average rating by month",
  },

  genrePanel: {
    title: "TOP GENRES",
    subtitle: (movies, genres) => `${movieCount(movies)} · ${genres} genre${genres === 1 ? "" : "s"}`,
    chartType: "Chart type",
    charts: { donut: "Donut", bar: "Bars", matrix: "Matrix", gauges: "Gauges" },
    loading: "Sorting genres…",
    empty: "No genre data available",
    donutLabel: "Genre pie chart",
    ofMovies: (percent) => `${percent} of films`,
    matrixDetail: (count, percent) => `${movieCount(count)} (${percent})`,
    matrixHint: "[ Tap or hover over a block ]",
    ofMaximum: (percent) => `${percent}% of the top genre`,
    byFrequency: "Genres by frequency",
  },

  directorsPanel: {
    title: "TOP DIRECTORS",
    subtitle: "With at least 2 films",
    viewLabel: "Director view",
    views: { cards: "List", hologram: "Hologram" },
    loading: "Analyzing directors…",
    noneRepeated: "No director has at least 2 films in this profile.",
    empty: "No director data available",
  },

  actorsPanel: {
    title: "TOP CAST",
    loading: "Exploring appearances…",
    empty: "No cast data available",
  },

  countriesPanel: {
    title: "TOP COUNTRIES",
    viewLabel: "Country view",
    views: { list: "List", nodes: "Sectors" },
    loading: "Tracking countries…",
    empty: "No country data available",
  },

  platformsPanel: {
    title: "STREAMING",
    subtitle: "Available by subscription in Mexico · Data from JustWatch",
    clearFilter: "Clear filter",
    loading: "Looking for platforms…",
    empty: "None of these films are on subscription streaming in Mexico",
  },

  opinionsPanel: {
    title: "UNPOPULAR OPINIONS",
    subtitle: "Biggest differences with the audience (TMDB)",
    loading: "Comparing with the audience…",
    above: "Above the audience",
    below: "Below the audience",
    compare: (profile, audience) => `Profile ${profile} · Audience ${audience}`,
    aligned: "Ratings are in line with the audience (TMDB): none differ by half a star or more.",
    noRatings: "This profile has no ratings to compare with the audience (TMDB) yet.",
    how: "The profile's rating minus the audience's on each film. TMDB scores from 0 to 10, so it's divided by 2 here. Up to 3 films per side are shown, with at least half a star of difference.",
  },

  topRatedPanel: {
    title: "TOP RATED",
    subtitle: "Average of the profile's ratings, with at least 2 films",
    loading: "Working out the top rated…",
    ratedMovies: (n) => `${movieCount(n)} rated`,
    empty: "No genre or director has at least 2 rated films yet",
  },

  quiz: {
    title: "QUIZ",
    notEnough: "There aren't enough films to build a quiz.",
    progress: (current, total) => `Question ${current} / ${total}`,
    completed: (score, total) => `Quiz complete: ${score} of ${total}`,
    correct: "Correct.",
    incorrect: (answer) => `Incorrect. The answer was ${answer}.`,
    results: "Results",
    score: "Score:",
    resultPerfect: "You know this diary by heart.",
    resultGood: "Good film memory.",
    resultLow: "Time to revisit the diary.",
    review: "Answer review",
    yourAnswer: (answer) => `Your answer: ${answer}`,
    rightAnswer: (answer) => `Correct answer: ${answer}`,
    answeredRight: "Correct",
    answeredWrong: "Incorrect",
    posterAlt: "Poster of the film to guess",
    starsIcon: "stars",
    questions: {
      rating: (title) => `What rating did "${title}" get on this profile?`,
      year: (title) => `What year was "${title}" released?`,
      director: (title) => `Who directed "${title}"?`,
      poster: () => "Which film is this poster from?",
    },
  },

  highLow: {
    label: "Higher or Lower",
    title: "HIGHER OR LOWER",
    category: "Category",
    categories: {
      rating: {
        label: "Rating",
        unit: "Audience rating",
        desc: "Guess whether the next film has a higher or lower rating.",
        sub: "From the audience (TMDB), on a scale of 0 to 5.",
      },
      popularity: {
        label: "Popularity",
        desc: "Guess which film is more popular today.",
        sub: "Based on recent activity on TMDB; it changes day to day.",
      },
      year: {
        label: "Release",
        unit: "Release",
        desc: "Guess which film came out more recently (Higher = newer).",
        sub: "Based on the official theatrical release date.",
      },
    },
    more: "More",
    less: "Less",
    popular: "popular",
    popularityReveal: (title, verdict, rival) => `${title} is ${verdict} popular than ${rival}`,
    higherLabel: "Higher",
    lowerLabel: "Lower",
    streak: (streak) => `Streak: ${streak}`,
    streakResetNote: "Changing category resets the streak.",
    allCorrect: "YOU GOT THEM ALL!",
    gameOver: "GAME OVER",
    finalStreak: (streak) => `Final streak: ${streak}`,
    hiddenValue: "Hidden value",
    shortcuts: "Shortcuts: ↑ Higher · ↓ Lower",
    statusFinished: (won, streak) =>
      `${won ? "You finished the game!" : "Game over"}. Final streak: ${streak}.`,
    statusCorrect: (reveal, streak) => `Correct. ${reveal}. Streak: ${streak}.`,
    statusWrong: (reveal) => `Incorrect. ${reveal}.`,
    notEnough: "There aren't enough films with data for this category.",
  },
}
