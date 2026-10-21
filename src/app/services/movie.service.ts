import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, retry, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { Movie, MovieDetail, TmdbPage } from '../models/movie.model';

export type TamanoImagen = 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

/**
 * Servicio de películas: concentra todas las llamadas a la API de TMDB
 * para que los componentes no conozcan URLs, parámetros ni encabezados.
 */
@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.tmdb.apiUrl;

  /** GET /movie/top_rated: películas mejor valoradas, 20 por página. */
  getTopRated(page = 1): Observable<TmdbPage<Movie>> {
    const params = new HttpParams()
      .set('language', environment.tmdb.language)
      .set('page', page);
    return this.http
      .get<TmdbPage<Movie>>(`${this.api}/movie/top_rated`, { params })
      .pipe(retry({ count: 2, delay: reintentarSoloErroresDeServidor }));
  }

  /** GET /movie/{movie_id}: detalle completo de una película. */
  getMovieDetail(id: number): Observable<MovieDetail> {
    const params = new HttpParams().set('language', environment.tmdb.language);
    return this.http
      .get<MovieDetail>(`${this.api}/movie/${id}`, { params })
      .pipe(retry({ count: 2, delay: reintentarSoloErroresDeServidor }));
  }

  /** Arma la URL de una imagen; TMDB solo entrega la ruta relativa del archivo. */
  imagen(ruta: string | null, tamano: TamanoImagen = 'w342'): string | null {
    return ruta ? `${environment.tmdb.imageUrl}/${tamano}${ruta}` : null;
  }
}

/**
 * Política de reintento: solo vale la pena repetir los errores 5xx y los de red
 * (estado 0), con espera creciente de 500 ms y 1 s. Un 401 o un 404 no se
 * arreglan repitiendo la misma petición, así que se propagan de inmediato.
 */
export function reintentarSoloErroresDeServidor(error: unknown, intento: number) {
  if (
    error instanceof HttpErrorResponse &&
    (error.status === 0 || error.status >= 500)
  ) {
    return timer(500 * intento);
  }
  return throwError(() => error);
}

/** Traduce el código de estado HTTP a un mensaje que entienda el usuario. */
export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }
  const detalle = error.error?.status_message
    ? ` (${error.error.status_message})`
    : '';
  switch (error.status) {
    case 0:
      return 'No hay conexión con TMDB. Revisa tu red e inténtalo de nuevo.';
    case 401:
      return `TMDB rechazó el token de acceso (401 Unauthorized)${detalle}.`;
    case 404:
      return `La película no existe en TMDB (404 Not Found)${detalle}.`;
    case 429:
      return 'Se superó el límite de peticiones de TMDB (429). Espera unos segundos.';
    default:
      if (error.status >= 500) {
        return `TMDB tiene una falla temporal (${error.status}). Se reintentó dos veces sin éxito.`;
      }
      return `La petición falló con el código ${error.status}${detalle}.`;
  }
}
