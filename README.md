# CruxTracker

**Progressive Web App** para el seguimiento de escalada deportiva y boulder. 100% offline, sin cuentas ni servidores.

Estética natural/outdoor inspirada en la roca y el bosque. Diseñada para usarse en móvil como app instalable.

## Características principales

- **Wizard de sesión en 6 pasos** con guardado automático de borrador
- **Dashboard de inicio** con racha de días, resumen semanal y mini heatmap
- **Estadísticas avanzadas**: evolución del grado máximo, heatmap tipo GitHub (12 meses), % a vista/encadenadas y zonas corporales débiles
- **Estiramientos guiados** con temporizador, vibración háptica y avisos de audio
- **Biblioteca de técnica** con +20 ejercicios por categoría (pies, manos, equilibrio, fuerza, coordinación) y objetivos semanales
- **Proyectos** con historial de intentos y fotos
- **Mapa de zonas outdoor** con Leaflet + OpenStreetMap (tiles cacheadas offline)
- **Registro de lesiones** por zona corporal con severidad e historial
- **Planificador semanal** con drag & drop entre días
- **Exportar / importar** todos los datos como JSON
- **Modo oscuro** opcional
- **100% offline**: Service Worker con Workbox, IndexedDB con Dexie

## Stack técnico

- React 18 + Vite + TypeScript
- Tailwind CSS (paleta verde / beige / tierra)
- Dexie.js (IndexedDB) — 11 tablas
- Zustand (estado global + persistencia)
- React Router v6
- vite-plugin-pwa + Workbox
- Recharts (gráficos)
- Leaflet + react-leaflet (mapa)
- Lucide React (iconos)
- date-fns (fechas, en español)

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/            # Button, Card, Input, Slider, Modal, Chip, EmptyState
│   ├── layout/        # TabBar + Layout
│   ├── session/       # Pasos del wizard
│   ├── charts/        # Heatmap
│   └── timer/         # TemporizadorEjercicio
├── data/              # grados, técnicas, estiramientos, zonas corporales
├── db/                # Dexie schema + types
├── hooks/             # useResumenSemanal
├── pages/             # Inicio, Sesion, Progreso, Tecnica, Perfil + sub-páginas
├── store/             # Zustand stores (app + sesión)
├── utils/             # fechas, imagen, audio, cn
├── App.tsx
├── main.tsx
├── router.tsx
└── index.css
```

## Instalación y desarrollo

```bash
npm install
npm run dev
```

La app estará en `http://localhost:5173`.

## Build de producción

```bash
npm run build
npm run preview
```

El bundle se genera en `dist/`. Sírvelo desde cualquier hosting estático (Vercel, Netlify, GitHub Pages, etc.).

> **Importante:** El Service Worker requiere HTTPS para registrarse en producción.

## Instalación como PWA

1. Abre la app en tu navegador móvil (Chrome / Safari / Edge).
2. Pulsa "Añadir a pantalla de inicio".
3. La app aparecerá como icono nativo, en modo standalone (sin barra del navegador).
4. Funciona sin conexión a internet una vez instalada.

## Iconos

Coloca en `public/icons/` las siguientes imágenes PNG:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `icon-512-maskable.png` (512×512 con padding seguro)

Hay un SVG base en `public/icons/icon.svg` que puedes convertir con cualquier herramienta (ImageMagick, RealFaviconGenerator, etc.).

## Datos y privacidad

Todos los datos viven en tu dispositivo (IndexedDB). No se envía nada a ningún servidor. Si cambias de dispositivo:

1. Ve a **Perfil → Exportar backup**.
2. Guarda el JSON descargado.
3. En el nuevo móvil, instala la app y **Perfil → Importar backup**.

## Paleta de colores

| Token             | Valor      | Uso                |
| ----------------- | ---------- | ------------------ |
| `crux-primary`    | `#4A7C59`  | Verde principal    |
| `crux-beige`      | `#F7F5F0`  | Fondo claro        |
| `crux-earth`      | `#8B6914`  | Acentos tierra     |
| `crux-danger`     | `#C44545`  | Errores / borrar   |
| `crux-warn`       | `#D9A441`  | Advertencias       |

## Licencia

MIT — Úsala libremente para tu propio entrenamiento.
