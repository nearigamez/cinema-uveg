import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

const CLAVE = 'cinema-uveg.token';

/**
 * Guarda el token de lectura de TMDB.
 * Primero usa el que se compiló en el environment; si no hay, el que el
 * usuario capturó en pantalla (queda en localStorage de su navegador).
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly valor = signal<string>(
    environment.tmdb.token || this.leerGuardado(),
  );

  readonly token = this.valor.asReadonly();

  tieneToken(): boolean {
    return this.valor().trim().length > 0;
  }

  guardar(token: string): void {
    const limpio = token.trim();
    this.valor.set(limpio);
    try {
      localStorage.setItem(CLAVE, limpio);
    } catch {
      // Navegación privada o almacenamiento bloqueado: el token vive solo en memoria.
    }
  }

  private leerGuardado(): string {
    try {
      return localStorage.getItem(CLAVE) ?? '';
    } catch {
      return '';
    }
  }
}
