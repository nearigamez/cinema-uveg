import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API, DETALLE } from '../../testing/datos-prueba';
import { MovieDetailComponent } from './movie-detail.component';

describe('MovieDetailComponent (de forma independiente)', () => {
  let fixture: ComponentFixture<MovieDetailComponent>;
  let http: HttpTestingController;
  let html: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MovieDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MovieDetailComponent);
    fixture.componentRef.setInput('id', 238);
    fixture.componentRef.setInput('embebido', true);
    html = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('muestra un aviso de carga mientras llega la respuesta', () => {
    expect(html.textContent).toContain('Cargando el detalle');
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
  });

  it('pinta título, lema, géneros, duración y ficha técnica', async () => {
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
    await fixture.whenStable();
    expect(html.querySelector('h2')?.textContent).toContain('El padrino');
    expect(html.querySelector('.lema')?.textContent).toContain(
      'no podrás rechazar',
    );
    const generos = [...html.querySelectorAll('.generos li')].map((li) =>
      li.textContent?.trim(),
    );
    expect(generos).toEqual(['Drama', 'Crimen']);
    expect(html.textContent).toContain('2 h 55 min');
    expect(html.textContent).toContain('Paramount Pictures');
    expect(html.querySelector('img.poster')?.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w342/padrino.jpg',
    );
  });

  it('emite «cerrado» cuando se presiona el botón de cerrar', async () => {
    http.expectOne((r) => r.url === `${API}/movie/238`).flush(DETALLE);
    await fixture.whenStable();
    let cerrado = false;
    fixture.componentInstance.cerrado.subscribe(() => (cerrado = true));
    html.querySelector<HTMLButtonElement>('button.cerrar')!.click();
    expect(cerrado).toBe(true);
  });

  it('muestra el mensaje del 404 cuando la película no existe', async () => {
    http
      .expectOne((r) => r.url === `${API}/movie/238`)
      .flush(
        {
          status_code: 34,
          status_message: 'The resource you requested could not be found.',
        },
        { status: 404, statusText: 'Not Found' },
      );
    await fixture.whenStable();
    expect(html.querySelector('[role="alert"]')?.textContent).toContain(
      '404 Not Found',
    );
  });

  it('al cambiar el id cancela la petición anterior y pide la nueva', async () => {
    const primera = http.expectOne((r) => r.url === `${API}/movie/238`);
    fixture.componentRef.setInput('id', 278);
    await fixture.whenStable();
    expect(primera.cancelled).toBe(true);
    http
      .expectOne((r) => r.url === `${API}/movie/278`)
      .flush({ ...DETALLE, id: 278, title: 'Sueño de fuga' });
    await fixture.whenStable();
    expect(html.querySelector('h2')?.textContent).toContain('Sueño de fuga');
  });
});
