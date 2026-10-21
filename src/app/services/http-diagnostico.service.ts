import { Injectable, signal } from '@angular/core';

/** Lo que se registra de cada petición a TMDB para mostrarlo en el pie de la página. */
export interface RegistroHttp {
  metodo: string;
  ruta: string;
  estado: number;
  textoEstado: string;
  milisegundos: number;
  contentType: string | null;
  cacheControl: string | null;
  limiteRestante: string | null;
}

@Injectable({ providedIn: 'root' })
export class HttpDiagnosticoService {
  private readonly registros = signal<RegistroHttp[]>([]);

  /** Las últimas cinco peticiones, la más reciente primero. */
  readonly historial = this.registros.asReadonly();

  registrar(registro: RegistroHttp): void {
    this.registros.update((lista) => [registro, ...lista].slice(0, 5));
  }
}
