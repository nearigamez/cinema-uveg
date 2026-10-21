import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CalificacionDirective } from './calificacion.directive';

@Component({
  imports: [CalificacionDirective],
  template: `<span [appCalificacion]="valor()">{{ valor() }}</span>`,
})
class Anfitrion {
  readonly valor = signal(8.7);
}

describe('CalificacionDirective', () => {
  it('cambia la clase según el promedio de votos', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.classList).toContain('calificacion--alta');
    expect(span.title).toBe('Promedio de votos: 8.7 de 10');

    fixture.componentInstance.valor.set(6.4);
    await fixture.whenStable();
    expect(span.classList).toContain('calificacion--media');

    fixture.componentInstance.valor.set(4.2);
    await fixture.whenStable();
    expect(span.classList).toContain('calificacion--baja');
    expect(span.classList).not.toContain('calificacion--media');
  });
});
