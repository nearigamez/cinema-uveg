import { Directive, computed, input } from '@angular/core';

/**
 * Directiva de atributo: colorea la insignia de calificación según el
 * promedio de votos (verde de 8 en adelante, ámbar de 6 a 8, rojo debajo de 6).
 * Uso: <span [appCalificacion]="pelicula.vote_average">8.7</span>
 */
@Directive({
  selector: '[appCalificacion]',
  host: {
    class: 'calificacion',
    '[class.calificacion--alta]': "nivel() === 'alta'",
    '[class.calificacion--media]': "nivel() === 'media'",
    '[class.calificacion--baja]': "nivel() === 'baja'",
    '[attr.title]':
      '"Promedio de votos: " + appCalificacion().toFixed(1) + " de 10"',
  },
})
export class CalificacionDirective {
  readonly appCalificacion = input.required<number>();

  readonly nivel = computed(() => {
    const valor = this.appCalificacion();
    if (valor >= 8) return 'alta';
    if (valor >= 6) return 'media';
    return 'baja';
  });
}
