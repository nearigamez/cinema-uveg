import { Movie, MovieDetail, TmdbPage } from '../app/models/movie.model';

/** Datos de prueba con la misma forma que las respuestas reales de TMDB. */
export const PELICULAS: Movie[] = [
  {
    id: 238,
    title: 'El padrino',
    original_title: 'The Godfather',
    overview:
      'Don Vito Corleone, jefe de una de las cinco familias que dominan la mafia de Nueva York.',
    poster_path: '/padrino.jpg',
    backdrop_path: '/padrino-fondo.jpg',
    release_date: '1972-03-14',
    vote_average: 8.69,
    vote_count: 22000,
    genre_ids: [18, 80],
  },
  {
    id: 278,
    title: 'Sueño de fuga',
    original_title: 'The Shawshank Redemption',
    overview: 'Andy Dufresne es condenado a dos cadenas perpetuas.',
    poster_path: '/fuga.jpg',
    backdrop_path: null,
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 28000,
    genre_ids: [18],
  },
  {
    id: 129,
    title: 'El viaje de Chihiro',
    original_title: '千と千尋の神隠し',
    overview: 'Chihiro y sus padres se pierden camino a su nueva casa.',
    poster_path: null,
    backdrop_path: null,
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 17000,
    genre_ids: [16, 10751],
  },
];

export function paginaDePrueba(page = 1): TmdbPage<Movie> {
  return { page, results: PELICULAS, total_pages: 528, total_results: 10551 };
}

export const DETALLE: MovieDetail = {
  id: 238,
  title: 'El padrino',
  original_title: 'The Godfather',
  overview:
    'Don Vito Corleone, jefe de una de las cinco familias que dominan la mafia de Nueva York.',
  poster_path: '/padrino.jpg',
  backdrop_path: '/padrino-fondo.jpg',
  release_date: '1972-03-14',
  vote_average: 8.69,
  vote_count: 22000,
  tagline: 'Una oferta que no podrás rechazar.',
  runtime: 175,
  genres: [
    { id: 18, name: 'Drama' },
    { id: 80, name: 'Crimen' },
  ],
  budget: 6000000,
  revenue: 245066411,
  status: 'Released',
  homepage: null,
  original_language: 'en',
  production_companies: [
    { id: 4, name: 'Paramount Pictures', logo_path: null, origin_country: 'US' },
  ],
};

export const API = 'https://api.themoviedb.org/3';
