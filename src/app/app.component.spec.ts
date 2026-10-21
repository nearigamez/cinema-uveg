import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { API, DETALLE, paginaDePrueba } from '../testing/datos-prueba';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { tmdbInterceptor } from './interceptors/tmdb.interceptor';
import { TokenService } from './services/token.service';

describe('AppComponent (componentes en conjunto)', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([tmdbInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide el token cuando no hay uno configurado', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const html: HTMLElement = fixture.nativeElement;
    expect(html.querySelector('.marca strong')?.textContent).toBe('Cinema UVEG');
    expect(html.querySelector('form.token')).not.toBeNull();
  });

  it('flujo completo: lista → presionar película → detalle, con el registro HTTP en el pie', async () => {
    TestBed.inject(TokenService).guardar('token-de-prueba');
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const html: HTMLElement = fixture.nativeElement;

    const lista = http.expectOne((r) => r.url === `${API}/movie/top_rated`);
    expect(lista.request.headers.get('Authorization')).toBe(
      'Bearer token-de-prueba',
    );
    lista.flush(paginaDePrueba(), {
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
    });
    await fixture.whenStable();

    html.querySelector<HTMLButtonElement>('app-movie-list .tarjeta')!.click();
    await fixture.whenStable();
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
    await fixture.whenStable();

    expect(html.querySelector('app-movie-detail h2')?.textContent).toContain(
      'El padrino',
    );
    const filas = html.querySelectorAll('.pie tbody tr');
    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain('/movie/238');
    expect(filas[1].textContent).toContain('200');
  });

  it('la ruta /pelicula/:id muestra el detalle como página propia', async () => {
    TestBed.inject(TokenService).guardar('token-de-prueba');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/pelicula/238');
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
    await harness.fixture.whenStable();
    const html: HTMLElement = harness.routeNativeElement!;
    expect(html.querySelector('h2')?.textContent).toContain('El padrino');
    expect(html.querySelector('a.volver')?.textContent).toContain(
      'Regresar a la lista',
    );
  });
});
