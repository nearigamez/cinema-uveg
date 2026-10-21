import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpDiagnosticoService } from './services/http-diagnostico.service';
import { TokenService } from './services/token.service';

/**
 * Componente raíz de Cinema UVEG: encabezado, salida del router y un pie
 * con el registro de las últimas peticiones HTTP (código de estado,
 * tiempo y encabezados de la respuesta).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly titulo = 'Cinema UVEG';
  readonly tokens = inject(TokenService);
  readonly diagnostico = inject(HttpDiagnosticoService);

  guardarToken(evento: SubmitEvent, campo: HTMLInputElement): void {
    evento.preventDefault();
    if (campo.value.trim()) {
      this.tokens.guardar(campo.value);
    }
  }
}
