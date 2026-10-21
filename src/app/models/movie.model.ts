/** Película tal como llega en las listas de TMDB (por ejemplo, /movie/top_rated). */
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

/** Respuesta de /movie/{movie_id}: trae más campos que la versión de lista. */
export interface MovieDetail extends Omit<Movie, 'genre_ids'> {
  tagline: string;
  runtime: number | null;
  genres: Genre[];
  budget: number;
  revenue: number;
  status: string;
  homepage: string | null;
  original_language: string;
  production_companies: ProductionCompany[];
}

/** Envoltura paginada que TMDB usa en todas sus listas. */
export interface TmdbPage<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** Cuerpo de error que TMDB devuelve junto con el código de estado. */
export interface TmdbError {
  status_code: number;
  status_message: string;
  success: false;
}
