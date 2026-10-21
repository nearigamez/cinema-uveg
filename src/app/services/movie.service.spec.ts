import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API, DETALLE, paginaDePrueba } from '../../testing/datos-prueba';
import {
  MovieService,
  mensajeDeError,
  reintentarSoloErroresDeServidor,
} from './movie.service';

describe('MovieService', () => {
  let servicio: MovieService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(MovieService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide /movie/top_rated en español y con el número de página', async () => {
    const respuesta = firstValueFrom(servicio.getTopRated(2));
    const req = http.expectOne((r) => r.url === `${API}/movie/top_rated`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('language')).toBe('es-MX');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(paginaDePrueba(2));
    const pagina = await respuesta;
    expect(pagina.page).toBe(2);
    expect(pagina.results.length).toBe(3);
  });

  it('pide /movie/{id} para el detalle de una película', async () => {
    const respuesta = firstValueFrom(servicio.getMovieDetail(238));
    const req = http.expectOne((r) => r.url === `${API}/movie/238`);
    expect(req.request.params.get('language')).toBe('es-MX');
    req.flush(DETALLE);
    expect((await respuesta).title).toBe('El padrino');
  });

  it('no reintenta un 401: el error llega de inmediato al componente', async () => {
    const respuesta = firstValueFrom(servicio.getTopRated());
    http
      .expectOne((r) => r.url === `${API}/movie/top_rated`)
      .flush(
        { status_code: 7, status_message: 'Invalid API key' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await expect(respuesta).rejects.toMatchObject({ status: 401 });
  });

  it('arma la URL de las imágenes y devuelve null si no hay archivo', () => {
    expect(servicio.imagen('/padrino.jpg', 'w500')).toBe(
      'https://image.tmdb.org/t/p/w500/padrino.jpg',
    );
    expect(servicio.imagen(null)).toBeNull();
  });

  it('solo programa reintento para errores 5xx y de red', () => {
    const error500 = new HttpErrorResponse({ status: 500 });
    const error0 = new HttpErrorResponse({ status: 0 });
    const error404 = new HttpErrorResponse({ status: 404 });
    let reintenta500 = false;
    let falla404 = false;
    reintentarSoloErroresDeServidor(error500, 1).subscribe({
      complete: () => (reintenta500 = true),
    });
    reintentarSoloErroresDeServidor(error0, 1).subscribe();
    reintentarSoloErroresDeServidor(error404, 1).subscribe({
      error: () => (falla404 = true),
    });
    expect(falla404).toBe(true);
    // El 500 devuelve un temporizador: todavía no completa en el mismo ciclo.
    expect(reintenta500).toBe(false);
  });

  it('traduce cada código de estado a un mensaje en español', () => {
    const msj = (status: number) =>
      mensajeDeError(new HttpErrorResponse({ status }));
    expect(msj(0)).toContain('No hay conexión');
    expect(msj(401)).toContain('401');
    expect(msj(404)).toContain('no existe');
    expect(msj(429)).toContain('límite');
    expect(msj(503)).toContain('falla temporal');
    expect(mensajeDeError(new Error('x'))).toBe('Ocurrió un error inesperado.');
  });
});
