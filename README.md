<div align="center">

# BENTOBOXD

**Dashboard analítico visual para Letterboxd**

![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-000000?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge&logo=opensourceinitiative&logoColor=white)

</div>

## Descripción

Bentoboxd es una aplicación web que convierte el feed de Letterboxd de cualquier usuario en un panel de visualización interactivo con estética cyberpunk/HUD. Ingresa un usuario y obtén métricas, gráficos y vistas alternativas de su actividad cinematográfica reciente.

Nace como un experimento personal para explorar visualización de datos, integración de APIs y animaciones CSS, todo envuelto en una interfaz oscura con temática de interfaz de máquina. Sin frameworks de UI, sin TypeScript, sin dependencias pesadas — solo React, Vite y CSS.

## Características

- **Feed RSS de Letterboxd** — Ingresa un nombre de usuario o URL y obtén sus últimas 15 películas vistas
- **3 modos de visualización:**
  - **Bento** — Cuadrícula dinámica con 10 patrones aleatorios
  - **Timeline** — Línea de tiempo cronológica con pósters y calificaciones
  - **Terminal** — Listado estilo terminal retro
- **Paneles de análisis:**
  - **Géneros** — 5 tipos de gráfico (Donut, Radar, Barras, Matriz, Gauges)
  - **Directores** — Vista de tarjetas, holograma u órbita
  - **Actores** — Cuadrícula, espectro o constelación
  - **Países de producción** — Tabla o sectores con banderas
  - **Plataformas de streaming** — Disponibilidad en México
- **Juegos:**
  - **Higher or Lower** — Adivina si la siguiente película tiene mayor/menor rating, popularidad o año
  - **Quiz** — 5 preguntas sobre año de estreno o calificación
- **Persistencia** — Últimos 3 perfiles guardados en localStorage

## Stack

| Tecnología           | Versión                 |
| -------------------- | ----------------------- |
| React                | 19                      |
| Vite                 | 7                       |
| ESLint (flat config) | 9                       |
| CSS                  | Vanilla + design tokens |
| APIs                 | Letterboxd RSS, TMDB v3 |

## Requisitos

- Node.js (LTS recomendada)
- npm

## Instalación

```bash
git clone https://github.com/tu-usuario/letterboxd-bento.git
cd letterboxd-bento
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_TMDB_API_KEY=tu_api_key_de_tmdb
```

Obtén una API key gratuita en [themoviedb.org](https://www.themoviedb.org/settings/api).

## Uso

```bash
npm run dev        # Servidor de desarrollo → http://localhost:5173
npm run build      # Build de producción → dist/
npm run preview    # Previsualizar build
npm run lint       # Ejecutar ESLint
```

## Estructura

```
src/
├── App.jsx                  # Componente principal
├── main.jsx                 # Punto de entrada
├── index.css                # Estilos globales
├── components/              # Componentes React
│   ├── BentoGrid/           # Cuadrícula bento
│   ├── GenrePanel/          # Gráficos de géneros
│   ├── DirectorsPanel/      # Paneles de directores
│   ├── ActorsPanel/         # Paneles de actores
│   ├── CountriesPanel/      # Paneles de países
│   ├── PlatformsPanel/      # Plataformas de streaming
│   └── QuizModal/           # Modal de quiz
├── hooks/                   # Custom hooks
│   ├── useLetterboxdFeed.js # Fetch y parse de RSS
│   └── useTMDBMetadata.js   # Fetch de metadatos TMDB
├── services/                # Servicios API
│   ├── letterboxd.js        # Parseo de RSS
│   └── tmdb.js              # Cliente TMDB
├── constants/               # Constantes y mapeos
├── styles/                  # Tokens de diseño
└── utils/                   # Utilidades
```

## Licencia

MIT
