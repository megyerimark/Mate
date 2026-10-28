import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';

/** Egyedi, fénylő egérmutató asztali gépen; linkek fölött kinagyobbodik. */
@Component({
  selector: 'app-cursor',
  template: `<div class="cursor-dot"></div><div class="cursor-ring"></div>`,
})
export class Cursor {
  constructor() {
    const host = inject(ElementRef<HTMLElement>);
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
      const el: HTMLElement = host.nativeElement;
      const dot = el.querySelector<HTMLElement>('.cursor-dot')!;
      const ring = el.querySelector<HTMLElement>('.cursor-ring')!;
      document.documentElement.classList.add('has-cursor');

      let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, frame = 0;
      const move = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        const interactive = (e.target as Element).closest('a, button, summary, input, select, textarea, label');
        el.classList.toggle('hover', !!interactive);
      };
      const loop = () => {
        rx += (x - rx) * 0.18;
        ry += (y - ry) * 0.18;
        dot.style.transform = `translate(${x}px, ${y}px)`;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        frame = requestAnimationFrame(loop);
      };
      zone.runOutsideAngular(() => {
        window.addEventListener('pointermove', move, { passive: true });
        frame = requestAnimationFrame(loop);
      });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('pointermove', move);
        document.documentElement.classList.remove('has-cursor');
      });
    });
  }
}
