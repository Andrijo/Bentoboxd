<div align="center">

# BENTOBOXD

**Dashboard analítico visual para Letterboxd**

![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-000000?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge&logo=opensourceinitiative&logoColor=white)

</div>

## Descripción

Bentoboxd es una aplicación web que convierte el feed de Letterboxd de cualquier usuario en un panel de visualización interactivo con una estética editorial minimalista de paleta restringida. Ingresa un usuario y obtén métricas, gráficos y vistas alternativas de su actividad cinematográfica reciente.

Nace como un experimento personal para explorar visualización de datos, integración de APIs y animaciones CSS, todo en una interfaz sobria de cinco tonos. Sin frameworks de UI, sin TypeScript, sin dependencias pesadas — solo React, Vite y CSS.

## Características

- **Feed RSS de Letterboxd** — Ingresa un nombre de usuario o URL y obtén sus últimas 50 películas vistas (las listas del feed se ignoran). Las vistas muestran las 20 más recientes; las estadísticas y los juegos usan las 50
- **3 modos de visualización:**
  - **Bento** — Cuadrícula dinámica sin huecos con tarjetas 1x1, 2x1, 1x2 y 2x2 (en móvil, 3 columnas sin 1x2)
  - **Timeline** — Línea de tiempo cronológica con pósters y calificaciones
  - **Terminal** — Listado estilo terminal retro
- **Paneles de análisis:**
  - **Resumen** — Promedio, comparación con TMDB, me gusta, revisiones, década favorita, tiempo viendo, ritmo semanal y día favorito
  - **Opiniones impopulares** — Las películas donde más te alejas del promedio de TMDB, a favor y en contra
  - **Mejor calificados por ti** — Géneros y directores con el mejor promedio de tus calificaciones (mínimo 2 películas)
  - **Géneros** — 5 tipos de gráfico (Donut, Radar, Barras, Matriz, Gauges)
  - **Directores** — Vista de tarjetas, holograma u órbita
  - **Actores** — Cuadrícula, espectro o constelación
  - **Países de producción** — Tabla o sectores con banderas
  - **Plataformas de streaming** — Disponibilidad en México
- **Juegos** (páginas propias, enlazables y compatibles con el botón atrás):
  - **Higher or Lower** (`#higher-lower`) — Adivina si la siguiente película tiene mayor/menor rating, popularidad o año
  - **Quiz** (`#quiz`) — 5 preguntas sobre año de estreno o calificación
- **Skeleton loading** mientras cargan el feed y los metadatos de TMDB
- **Tema claro y oscuro** — Botón de cambio en la cabecera; respeta `prefers-color-scheme` en la primera visita y recuerda tu elección en localStorage (sin parpadeo al cargar)
- **Paleta de cinco tonos** — Todos los colores salen de tokens CSS (tintas y crema); los gráficos usan rampas derivadas de ellos
- **Diseño responsive** con layout adaptado a móvil
- **Accesibilidad** — Etiquetas ARIA, anuncios en vivo para los juegos y enlaces externos señalados para lectores de pantalla
- **Enlaces compartibles** — El perfil va en la URL (`?user=<usuario>`, combinable con `#quiz` o `#higher-lower`): se puede compartir, recargar y navegar con atrás/adelante entre perfiles
- **Persistencia** — Últimos 3 perfiles guardados en localStorage

## Stack

| Tecnología           | Versión                 |
| -------------------- | ----------------------- |
| React                | 19                      |
| Vite                 | 7                       |
| ESLint (flat config) | 9                       |
| CSS                  | Vanilla + design tokens |
| Tipografías          | Milker, Carmine, DM Sans (autoalojadas) |
| Tests                | Vitest 3 + Testing Library |
| APIs                 | Letterboxd RSS, TMDB v3 |

## Requisitos

- Node.js (LTS recomendada)
- npm

## Instalación

```bash
git clone https://github.com/Andrijo/Bentoboxd.git
cd Bentoboxd
npm install
```

## Configuración

Copia `.env.example` a `.env` y completa las variables:

```env
TMDB_API_KEY=tu_api_key_de_tmdb
# Solo producción (ver Despliegue)
# VITE_RSS_PROXY_URL=/api/rss
```

La key de TMDB **nunca llega al navegador**: el cliente llama a `/api/tmdb/...` y el proxy (Vite en local, `api/tmdb.js` en producción) la añade del lado del servidor. Solo se permiten los endpoints que usa la app (`search/movie` y `movie/<id>`).

Obtén una API key gratuita en [themoviedb.org](https://www.themoviedb.org/settings/api).

## Uso

```bash
npm run dev        # Servidor de desarrollo → http://localhost:5173
npm run build      # Build de producción → dist/
npm run preview    # Previsualizar build
npm run lint       # Ejecutar ESLint
npm run test       # Ejecutar tests (Vitest, modo watch)
npm run test:run   # Ejecutar tests una vez (CI)
```

Los tests usan Vitest + Testing Library (jsdom) y viven junto al código que prueban (`*.test.js`/`*.test.jsx`).

## CI

GitHub Actions (`.github/workflows/ci.yml`) ejecuta `lint`, `test:run` y `build` con Node 22 en cada push a `main` y en cada pull request.

## Despliegue (Vercel)

El RSS de Letterboxd **no permite CORS** y la key de TMDB no debe ir en el bundle, así que en producción la app usa dos funciones serverless listas para Vercel: `api/rss.js` y `api/tmdb.js` (enrutada por `vercel.json`).

1. Importa el repositorio en Vercel (detecta Vite automáticamente).
2. En **Settings → Environment Variables** define:
   - `TMDB_API_KEY` — tu key de TMDB. Si antes usabas `VITE_TMDB_API_KEY`, bórrala: ya no se usa y el prefijo `VITE_` la expondría.
   - `VITE_RSS_PROXY_URL` — **opcional**: en producción se usa `/api/rss` por defecto. Solo cámbialo si usas otro proxy.
3. Deploy. La app llamará a `/api/rss?user=<usuario>` y a `/api/tmdb/...`.

> **Si ves un error 401 de TMDB**, la variable `TMDB_API_KEY` no está definida (o es inválida) en el entorno de las funciones de Vercel. Corrígela y haz **Redeploy**.

En local solo necesitas `TMDB_API_KEY` en `.env`: `npm run dev` usa los proxies de `vite.config.js` (`/rss-proxy` y `/api/tmdb`).

> Como la key ya no se compila en el bundle, rótala en TMDB si la versión anterior estuvo publicada.

> En otro hosting, apunta `VITE_RSS_PROXY_URL` a tu propio proxy. Por defecto se le pasa `?user=<usuario>`; si la URL contiene `{user}`, se usa en modo path-style.

## Estructura

```
api/
├── rss.js                   # Proxy serverless del RSS (Vercel)
├── tmdb.js                  # Proxy serverless de TMDB (Vercel)
└── _lib/tmdbUpstream.js     # Rutas permitidas de TMDB (prod y dev)

src/
├── App.jsx                  # Componente principal
├── HighLowGame.jsx          # Página Higher or Lower (#higher-lower)
├── main.jsx                 # Punto de entrada
├── index.css                # Estilos globales
├── components/              # Componentes React
│   ├── AppHeader.jsx        # Cabecera y navegación
│   ├── AppFooter.jsx        # Pie con atribución (Letterboxd, TMDB)
│   ├── SearchSection.jsx    # Búsqueda de usuario
│   ├── RecentProfiles.jsx   # Perfiles recientes
│   ├── EmptyLanding.jsx     # Pantalla inicial sin perfil
│   ├── Panel/               # Panel, SegmentedControl y PanelError compartidos
│   ├── MovieViews.jsx       # Bento / Timeline / Terminal
│   ├── DataPanels.jsx       # Contenedor de paneles de análisis
│   ├── Skeleton.jsx         # Placeholders de carga
│   ├── PosterImage.jsx      # Póster con carga diferida
│   ├── StarRating.jsx       # Calificación en estrellas
│   ├── BentoGrid/           # Cuadrícula bento
│   ├── GenrePanel/          # Gráficos de géneros
│   ├── DirectorsPanel/      # Paneles de directores
│   ├── ActorsPanel/         # Paneles de actores
│   ├── CountriesPanel/      # Paneles de países
│   ├── PlatformsPanel/      # Plataformas de streaming
│   ├── TopRatedPanel/       # Mejor calificados por ti
│   ├── OpinionsPanel/       # Opiniones impopulares (vs TMDB)
│   └── Quiz/                # Página de quiz (#quiz)
├── hooks/                   # Custom hooks
│   ├── useLetterboxdFeed.js # Fetch y parse de RSS
│   ├── useTMDBMetadata.js   # Fetch de metadatos TMDB
│   ├── useHashRoute.js      # Páginas por hash (#quiz, #higher-lower)
│   ├── useGridColumns.js    # Columnas según el ancho disponible
│   ├── useTheme.js          # Tema claro/oscuro con persistencia
│   └── useOverscrollColor.js # Color del rebote de overscroll
├── services/                # Servicios API
│   ├── letterboxd.js        # Parseo de RSS
│   └── tmdb.js              # Cliente TMDB
├── constants/               # Constantes y mapeos
├── test/setup.js            # Setup de Vitest (jest-dom)
└── utils/                   # Utilidades
```

## Licencia

MIT
