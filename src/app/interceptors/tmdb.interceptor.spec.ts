import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API } from '../../testing/datos-prueba';
import { HttpDiagnosticoService } from '../services/http-diagnostico.service';
import { TokenService } from '../services/token.service';
import { tmdbInterceptor } from './tmdb.interceptor';

describe('tmdbInterceptor', () => {
  let cliente: HttpClient;
  let http: HttpTestingController;
  let diagnostico: HttpDiagnosticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tmdbInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    TestBed.inject(TokenService).guardar('token-de-prueba');
    cliente = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    diagnostico = TestBed.inject(HttpDiagnosticoService);
  });

  afterEach(() => http.verify());

  it('agrega Authorization: Bearer y Accept a las peticiones de TMDB', () => {
    cliente.get(`${API}/movie/top_rated`).subscribe();
    const req = http.expectOne(`${API}/movie/top_rated`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    expect(req.request.headers.get('Accept')).toBe('application/json');
    req.flush({});
  });

  it('no toca las peticiones que van a otros dominios', () => {
    cliente.get('https://ejemplo.com/datos').subscribe();
    const req = http.expectOne('https://ejemplo.com/datos');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('registra el código 200 y los encabezados de la respuesta', () => {
    cliente.get(`${API}/movie/238`).subscribe();
    http
      .expectOne(`${API}/movie/238`)
      .flush(
        {},
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Cache-Control': 'public, max-age=28800',
          },
        },
      );
    const [ultimo] = diagnostico.historial();
    expect(ultimo).toMatchObject({
      metodo: 'GET',
      ruta: '/movie/238',
      estado: 200,
      contentType: 'application/json;charset=utf-8',
      cacheControl: 'public, max-age=28800',
    });
  });

  it('registra también las respuestas con error, como un 404', () => {
    cliente.get(`${API}/movie/999999999`).subscribe({ error: () => undefined });
    http
      .expectOne(`${API}/movie/999999999`)
      .flush(
        {
          status_code: 34,
          status_message: 'The resource you requested could not be found.',
        },
        { status: 404, statusText: 'Not Found' },
      );
    expect(diagnostico.historial()[0]).toMatchObject({
      estado: 404,
      textoEstado: 'Not Found',
    });
  });
});
