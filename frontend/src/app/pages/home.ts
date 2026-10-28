import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QuoteForm } from '../components/quote-form';
import { MagneticDirective } from '../directives/magnetic.directive';
import { TiltDirective } from '../directives/tilt.directive';
import { Hero } from '../hero/hero';
import {
  FAQ, LANGUAGES, LIVE_TRANSLATION, PRICES, REASONS, SERVICES, SITE, STATS, STEPS, TESTIMONIALS,
} from '../site.config';

gsap.registerPlugin(ScrollTrigger);

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÖŐÚÜŰßÇÑ0123456789#%&@*+=?';

/** Betűnként "átfordítja" a from szöveget to-ra, t = 0..1. */
function scramble(from: string, to: string, t: number): string {
  const len = Math.max(from.length, to.length);
  let out = '';
  for (let i = 0; i < len; i++) {
    const at = (i / len) * 0.85;
    if (t >= at + 0.12) out += to[i] ?? '';
    else if (t >= at) out += to[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    else out += from[i] ?? '';
  }
  return out;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, QuoteForm, Hero, TiltDirective, MagneticDirective],
  templateUrl: './home.html',
})
export class Home {
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly site = SITE;
  protected readonly stats = STATS;
  protected readonly services = SERVICES;
  protected readonly languages = LANGUAGES;
  protected readonly live = LIVE_TRANSLATION;
  protected readonly steps = STEPS;
  protected readonly prices = PRICES;
  protected readonly reasons = REASONS;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly faq = FAQ;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const mm = gsap.matchMedia(this.host.nativeElement);
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          wide: '(min-width: 761px)',
        },
        (ctx) => {
          const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
          if (motion) this.animate(wide);
        },
      );
      // A képek, betűtípusok betöltése után újramérjük a pozíciókat.
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      destroyRef.onDestroy(() => mm.revert());
    });
  }

  private animate(wide: boolean): void {
    const root: HTMLElement = this.host.nativeElement;

    // Címsorok soronként csúsznak be.
    root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      gsap.from(el.querySelectorAll('.line > span'), {
        yPercent: 110,
        rotate: 3,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    gsap.set(root.querySelectorAll('[data-reveal]'), { opacity: 0 });
    ScrollTrigger.batch(root.querySelectorAll('[data-reveal]'), {
      start: 'top 88%',
      onEnter: (els) =>
        gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1, overwrite: true }),
    });

    // Élő fordítás: rögzített szakasz, görgetésre fordítódik a mondat.
    const liveText = root.querySelector<HTMLElement>('.live-text');
    const liveLang = root.querySelector<HTMLElement>('.live-lang');
    const liveBar = root.querySelector<HTMLElement>('.live-progress span');
    if (liveText && liveLang && liveBar) {
      const phrases = this.live;
      ScrollTrigger.create({
        trigger: root.querySelector('.live'),
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const segments = phrases.length - 1;
          const pos = Math.min(self.progress * segments * 1.15, segments);
          const i = Math.min(Math.floor(pos), segments - 1);
          const local = Math.min((pos - i) * 1.3, 1);
          liveText.textContent = scramble(phrases[i].text, phrases[i + 1].text, local);
          liveLang.textContent = phrases[local > 0.5 ? i + 1 : i].language;
          liveBar.style.transform = `scaleX(${self.progress})`;
        },
      });
    }

    // Lépések: asztali gépen vízszintesen görgetett panelek.
    const track = root.querySelector<HTMLElement>('.steps-track');
    if (track && wide) {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 64),
        ease: 'none',
        scrollTrigger: {
          trigger: root.querySelector('.steps-pin'),
          start: 'top top',
          end: () => `+=${track.scrollWidth}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    }

    // Számlálók.
    root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const target = Number(el.dataset['count']);
      const counter = { v: 0 };
      gsap.to(counter, {
        v: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => (el.textContent = Math.round(counter.v).toLocaleString('hu-HU')),
      });
    });

    // Nyelvi szalag: görgetéssel együtt csúszik.
    root.querySelectorAll<HTMLElement>('.marquee-row').forEach((row, i) => {
      gsap.to(row, {
        xPercent: i % 2 ? 12 : -12,
        ease: 'none',
        scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Záró felhívás: a nagy szöveg kinagyítódik.
    gsap.from(root.querySelector('.final-cta h2'), {
      scale: 0.7,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.final-cta'), start: 'top 90%', end: 'center center', scrub: true },
    });
  }
}
