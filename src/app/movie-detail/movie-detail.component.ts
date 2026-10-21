import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  UpperCasePipe,
} from '@angular/common';
import {
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';
import { CalificacionDirective } from '../directives/calificacion.directive';
import { MovieDetail } from '../models/movie.model';
import { MovieService, mensajeDeError } from '../services/movie.service';

/**
 * Muestra el detalle de una película.
 * Funciona de dos maneras: como hijo de MovieListComponent (recibe el id por
 * input y avisa con un output cuando se cierra) o como página propia en la ruta
 * /pelicula/:id, donde el router entrega el parámetro al mismo input.
 */
@Component({
  selector: 'app-movie-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    UpperCasePipe,
    RouterLink,
    CalificacionDirective,
  ],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css',
})
export class MovieDetailComponent {
  private readonly movies = inject(MovieService);

  /** Id de la película en TMDB; llega del padre o del parámetro de la ruta. */
  readonly id = input.required<number, unknown>({ transform: numberAttribute });
  /** true cuando se muestra como panel dentro de la lista. */
  readonly embebido = input(false, { transform: booleanAttribute });
  /** Avisa al componente padre que el usuario cerró el panel. */
  readonly cerrado = output<void>();

  readonly pelicula = signal<MovieDetail | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly poster = computed(() =>
    this.movies.imagen(this.pelicula()?.poster_path ?? null, 'w342'),
  );
  readonly fondo = computed(() =>
    this.movies.imagen(this.pelicula()?.backdrop_path ?? null, 'w1280'),
  );
  readonly duracion = computed(() => {
    const minutos = this.pelicula()?.runtime;
    if (!minutos) return null;
    const horas = Math.floor(minutos / 60);
    return horas ? `${horas} h ${minutos % 60} min` : `${minutos} min`;
  });

  constructor() {
    // Cada vez que cambia el id se cancela la petición anterior (switchMap)
    // y se pide el detalle nuevo.
    toObservable(this.id)
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
          this.pelicula.set(null);
        }),
        switchMap((id) =>
          this.movies.getMovieDetail(id).pipe(
            catchError((err) => {
              this.error.set(mensajeDeError(err));
              this.cargando.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((detalle) => {
        this.pelicula.set(detalle);
        this.cargando.set(false);
      });
  }

  cerrar(): void {
    this.cerrado.emit();
  }
}
