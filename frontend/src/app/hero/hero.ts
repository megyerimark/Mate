import {
  Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MagneticDirective } from '../directives/magnetic.directive';
import { HERO_WORDS, SITE } from '../site.config';
import type { GlyphScene } from './glyph-scene';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, MagneticDirective],
  templateUrl: './hero.html',
})
export class Hero {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly site = SITE;
  protected readonly words = HERO_WORDS;
  protected readonly index = signal(0);
  /** WebGL nélkül (vagy csökkentett mozgásnál) statikus szó jelenik meg. */
  protected readonly fallback = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const cleanup = this.init();
      destroyRef.onDestroy(() => cleanup.then((fn) => fn()));
    });
  }

  private async init(): Promise<() => void> {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !this.supportsWebGL()) {
      this.fallback.set(true);
      return () => {};
    }

    const font = "'Space Grotesk', 'Inter', sans-serif";
    const [, { GlyphScene }] = await Promise.all([
      document.fonts.load(`700 100px 'Space Grotesk'`, this.words.map((w) => w.text).join('')),
      import('./glyph-scene'),
    ]);

    const canvas = this.canvas().nativeElement;
    const scene: GlyphScene = new GlyphScene(canvas, {
      words: this.words,
      font,
      onWordChange: (i) => this.index.set(i),
    });
    scene.build();
    scene.play();

    const hero: HTMLElement = this.host.nativeElement;
    const onScroll = () => scene.setScatter(window.scrollY / Math.max(hero.offsetHeight * 0.8, 1));
    const onMove = (e: PointerEvent) => scene.setPointer(e.clientX, e.clientY);
    const onLeave = () => scene.clearPointer();
    const onResize = () => scene.resize();
    const onVisibility = () => (document.hidden || canvas.style.visibility ? scene.pause() : scene.play());

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    // Ha a hős szakasz nem látszik, ne fogyassza a gépet.
    // A rejtett vászon a böngésző kompozitálásából is kikerül.
    const io = new IntersectionObserver(([entry]) => {
      canvas.style.visibility = entry.isIntersecting ? '' : 'hidden';
      if (entry.isIntersecting) scene.play();
      else scene.pause();
    });
    io.observe(hero);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.dispose();
    };
  }

  private supportsWebGL(): boolean {
    try {
      return !!document.createElement('canvas').getContext('webgl2');
    } catch {
      return false;
    }
  }
}
