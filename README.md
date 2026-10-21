# Cinema UVEG

Aplicación en Angular 22 que muestra las películas mejor valoradas de
[The Movie Database (TMDB)](https://www.themoviedb.org/) y el detalle de cada una.

## Estructura

| Pieza | Archivo | Qué hace |
|---|---|---|
| AppComponent | `src/app/app.component.*` | Raíz: encabezado, router y pie con el diagnóstico HTTP |
| MovieListComponent | `src/app/movie-list/` | Lista paginada de `/movie/top_rated`; padre del detalle |
| MovieDetailComponent | `src/app/movie-detail/` | Detalle de `/movie/{id}`; panel hijo o página `/pelicula/:id` |
| MovieService | `src/app/services/movie.service.ts` | Llamadas a la API, reintentos y mensajes por código de estado |
| tmdbInterceptor | `src/app/interceptors/tmdb.interceptor.ts` | Encabezados `Authorization` y `Accept`, registro de estado y tiempos |
| CalificacionDirective | `src/app/directives/calificacion.directive.ts` | Colorea la calificación según el promedio |

## Correr en local

```bash
npm install
npm start          # http://localhost:4200
npm test           # 26 pruebas con Vitest
```

La primera vez la app pide el **token de acceso de lectura** de TMDB
(themoviedb.org → Configuración → API) y lo guarda en el navegador.

## Publicación

La versión publicada vive en la carpeta `docs/` y GitHub Pages la sirve desde la rama `main`:
https://nearigamez.github.io/cinema-uveg/

Para regenerarla:

```bash
npm run build:pages
```

y copiar el contenido de `dist/cinema-uveg/browser/` a `docs/`.

Este producto usa la API de TMDB, pero TMDB no lo respalda ni lo certifica.
