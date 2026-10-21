import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpDiagnosticoService } from '../services/http-diagnostico.service';
import { TokenService } from '../services/token.service';

/**
 * Interceptor funcional para las peticiones a TMDB:
 * 1. agrega los encabezados Authorization (Bearer) y Accept;
 * 2. mide el tiempo de respuesta y registra el código de estado y los
 *    encabezados que sirven para diagnosticar (Content-Type, Cache-Control).
 */
export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.tmdb.apiUrl)) {
    return next(req);
  }

  const tokens = inject(TokenService);
  const diagnostico = inject(HttpDiagnosticoService);
  const inicio = performance.now();
  const ruta = req.url.replace(environment.tmdb.apiUrl, '');

  const conEncabezados = req.clone({
    setHeaders: {
      Authorization: `Bearer ${tokens.token()}`,
      Accept: 'application/json',
    },
  });

  return next(conEncabezados).pipe(
    tap({
      next: (evento) => {
        if (evento instanceof HttpResponse) {
          diagnostico.registrar({
            metodo: req.method,
            ruta,
            estado: evento.status,
            textoEstado: evento.statusText || 'OK',
            milisegundos: Math.round(performance.now() - inicio),
            contentType: evento.headers.get('Content-Type'),
            cacheControl: evento.headers.get('Cache-Control'),
            limiteRestante: evento.headers.get('X-RateLimit-Remaining'),
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        diagnostico.registrar({
          metodo: req.method,
          ruta,
          estado: error.status,
          textoEstado: error.statusText || 'Error',
          milisegundos: Math.round(performance.now() - inicio),
          contentType: error.headers?.get('Content-Type') ?? null,
          cacheControl: error.headers?.get('Cache-Control') ?? null,
          limiteRestante: error.headers?.get('X-RateLimit-Remaining') ?? null,
        });
      },
    }),
  );
};
