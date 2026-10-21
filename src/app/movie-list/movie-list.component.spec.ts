import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API, DETALLE, paginaDePrueba } from '../../testing/datos-prueba';
import { MovieListComponent } from './movie-list.component';

const esTopRated =
  (pagina: number) =>
  (r: { url: string; params: { get(k: string): string | null } }) =>
    r.url === `${API}/movie/top_rated` && r.params.get('page') === String(pagina);

describe('MovieListComponent (de forma independiente)', () => {
  let fixture: ComponentFixture<MovieListComponent>;
  let http: HttpTestingController;
  let html: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MovieListComponent);
    html = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function cargarPagina(pagina = 1) {
    http.expectOne(esTopRated(pagina)).flush(paginaDePrueba(pagina));
    await fixture.whenStable();
  }

  it('pide la primera página al iniciar y muestra una tarjeta por película', async () => {
    expect(html.querySelector('.esqueleto')).not.toBeNull();
    await cargarPagina();
    const titulos = [...html.querySelectorAll('.tarjeta .titulo')].map((t) =>
      t.textContent?.trim(),
    );
    expect(titulos).toEqual(['El padrino', 'Sueño de fuga', 'El viaje de Chihiro']);
    expect(html.querySelector('.sub')?.textContent).toContain('10,551 títulos');
    expect(html.querySelectorAll('.sin-poster').length).toBe(1);
  });

  it('al presionar una película muestra MovieDetailComponent con su detalle', async () => {
    await cargarPagina();
    expect(html.querySelector('app-movie-detail')).toBeNull();
    html.querySelector<HTMLButtonElement>('.tarjeta')!.click();
    await fixture.whenStable();
    expect(html.querySelector('app-movie-detail')).not.toBeNull();
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
    await fixture.whenStable();
    expect(html.querySelector('app-movie-detail h2')?.textContent).toContain(
      'El padrino',
    );
  });

  it('cierra el detalle cuando el hijo emite «cerrado»', async () => {
    await cargarPagina();
    html.querySelector<HTMLButtonElement>('.tarjeta')!.click();
    await fixture.whenStable();
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
    await fixture.whenStable();
    html
      .querySelector<HTMLButtonElement>('app-movie-detail button.cerrar')!
      .click();
    await fixture.whenStable();
    expect(html.querySelector('app-movie-detail')).toBeNull();
  });

  it('el botón «Siguiente» pide la página 2', async () => {
    await cargarPagina();
    const siguiente = [
      ...html.querySelectorAll<HTMLButtonElement>('.paginacion button'),
    ].find((b) => b.textContent?.includes('Siguiente'))!;
    siguiente.click();
    await fixture.whenStable();
    await cargarPagina(2);
    expect(html.querySelector('.puesto')?.textContent).toBe('#21');
  });

  it('filtra por título sin volver a llamar a la API', async () => {
    await cargarPagina();
    const campo = html.querySelector<HTMLInputElement>('.buscador')!;
    campo.value = 'chihiro';
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(html.querySelectorAll('.tarjeta').length).toBe(1);
    campo.value = 'zzz';
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(html.querySelector('.vacio')?.textContent).toContain('zzz');
  });

  it('cambia a la vista de lista con @switch', async () => {
    await cargarPagina();
    const botonLista = [
      ...html.querySelectorAll<HTMLButtonElement>('.alternar button'),
    ][1];
    botonLista.click();
    await fixture.whenStable();
    expect(html.querySelector('.cuadricula')).toBeNull();
    expect(html.querySelectorAll('.renglon').length).toBe(3);
  });

  it('con un 401 muestra el error y «Reintentar» repite la petición', async () => {
    http
      .expectOne(esTopRated(1))
      .flush(
        {
          status_code: 7,
          status_message: 'Invalid API key: You must be granted a valid key.',
        },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();
    expect(html.querySelector('[role="alert"]')?.textContent).toContain(
      '401 Unauthorized',
    );
    html.querySelector<HTMLButtonElement>('.aviso button')!.click();
    await fixture.whenStable();
    await cargarPagina(1);
    expect(html.querySelectorAll('.tarjeta').length).toBe(3);
  });
});
