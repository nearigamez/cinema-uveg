import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';
import { CalificacionDirective } from '../directives/calificacion.directive';
import { Movie } from '../models/movie.model';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';
import { MovieService, mensajeDeError } from '../services/movie.service';

export type Vista = 'cuadricula' | 'lista';

/**
 * Lista las películas mejor valoradas que devuelve el servicio.
 * Es el componente padre de MovieDetailComponent: al presionar una película
 * guarda su id y el hijo se encarga de pedir y mostrar el detalle.
 */
@Component({
  selector: 'app-movie-list',
  imports: [
    DatePipe,
    DecimalPipe,
    SlicePipe,
    CalificacionDirective,
    MovieDetailComponent,
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css',
})
export class MovieListComponent {
  private readonly movies = inject(MovieService);

  readonly pagina = signal(1);
  readonly totalPaginas = signal(1);
  readonly totalResultados = signal(0);
  readonly peliculas = signal<Movie[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtro = signal('');
  readonly vista = signal<Vista>('cuadricula');
  /** Id de la película que el usuario presionó; null cuando no hay ninguna. */
  readonly seleccionada = signal<number | null>(null);
  /** Se incrementa al presionar «Reintentar» para repetir la misma petición. */
  private readonly intento = signal(0);
  private readonly solicitud = computed(() => ({
    pagina: this.pagina(),
    intento: this.intento(),
  }));

  /** Filtro local por título, sin volver a llamar a la API. */
  readonly visibles = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return texto
      ? this.peliculas().filter((p) => p.title.toLowerCase().includes(texto))
      : this.peliculas();
  });

  /** Lugar de la película en el ranking global de TMDB (20 por página). */
  readonly desplazamiento = computed(() => (this.pagina() - 1) * 20);

  constructor() {
    toObservable(this.solicitud)
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap(({ pagina }) =>
          this.movies.getTopRated(pagina).pipe(
            catchError((err) => {
              this.error.set(mensajeDeError(err));
              this.cargando.set(false);
              this.peliculas.set([]);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((respuesta) => {
        this.peliculas.set(respuesta.results);
        // TMDB solo deja consultar hasta la página 500.
        this.totalPaginas.set(Math.min(respuesta.total_pages, 500));
        this.totalResultados.set(respuesta.total_results);
        this.cargando.set(false);
      });
  }

  poster(pelicula: Movie): string | null {
    return this.movies.imagen(pelicula.poster_path, 'w342');
  }

  seleccionar(pelicula: Movie): void {
    this.seleccionada.set(pelicula.id);
  }

  cerrarDetalle(): void {
    this.seleccionada.set(null);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.pagina())
      return;
    this.seleccionada.set(null);
    this.pagina.set(pagina);
  }

  alFiltrar(evento: Event): void {
    this.filtro.set((evento.target as HTMLInputElement).value);
  }

  reintentar(): void {
    this.intento.update((n) => n + 1);
  }
}
