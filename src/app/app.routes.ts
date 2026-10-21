import { Routes } from '@angular/router';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { MovieListComponent } from './movie-list/movie-list.component';

export const routes: Routes = [
  {
    path: '',
    component: MovieListComponent,
    title: 'Cinema UVEG · Mejor valoradas',
  },
  {
    path: 'pelicula/:id',
    component: MovieDetailComponent,
    title: 'Cinema UVEG · Detalle',
  },
  { path: '**', redirectTo: '' },
];
