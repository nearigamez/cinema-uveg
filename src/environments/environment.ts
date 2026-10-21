/**
 * Configuración de producción.
 * El token de lectura de TMDB no se guarda en el repositorio: el script
 * `npm run build:pages` lo escribe aquí justo antes de compilar, y si queda
 * vacío la aplicación lo pide en pantalla y lo guarda en el navegador.
 */
export const environment = {
  production: true,
  tmdb: {
    apiUrl: 'https://api.themoviedb.org/3',
    imageUrl: 'https://image.tmdb.org/t/p',
    language: 'es-MX',
    token: '',
  },
};
