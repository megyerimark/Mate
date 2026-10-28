import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

/** A gomb finoman az egérmutató felé húzódik (csak egeres eszközön). */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private cleanup = () => {};

  ngOnInit(): void {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const node: HTMLElement = this.el.nativeElement;
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      node.style.transform = `translate(${x}px, ${y}px)`;
    };
    const leave = () => (node.style.transform = '');
    this.zone.runOutsideAngular(() => {
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', leave);
    });
    this.cleanup = () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', leave);
    };
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
