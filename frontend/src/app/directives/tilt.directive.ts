import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

/** 3D döntés egérmozgásra, és a fényfolt követi a mutatót (--mx, --my). */
@Directive({ selector: '[appTilt]' })
export class TiltDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private cleanup = () => {};

  ngOnInit(): void {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node: HTMLElement = this.el.nativeElement;
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      node.style.setProperty('--mx', `${px * 100}%`);
      node.style.setProperty('--my', `${py * 100}%`);
      node.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateZ(0)`;
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
