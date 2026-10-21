import { registerLocaleData } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import localeEsMx from '@angular/common/locales/es-MX';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
} from '@angular/router';
import { routes } from './app.routes';
import { tmdbInterceptor } from './interceptors/tmdb.interceptor';

registerLocaleData(localeEsMx);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: el parámetro :id de la ruta llega directo al input id.
    // withHashLocation: rutas con # para que funcionen en GitHub Pages sin servidor.
    provideRouter(routes, withComponentInputBinding(), withHashLocation()),
    provideHttpClient(withFetch(), withInterceptors([tmdbInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-MX' },
  ],
};
