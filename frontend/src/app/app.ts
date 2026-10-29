import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Cursor } from './components/cursor';
import { Footer } from './components/footer';
import { Header } from './components/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Cursor],
  template: `
    @if (!isAdmin()) {
      <div class="intro" aria-hidden="true">
        <div class="intro-logo"><span class="logo-mark">✓</span> Done<strong>Translations</strong></div>
      </div>
      <app-cursor />
      <app-header />
      <main id="top"><router-outlet /></main>
      <app-footer />
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  private readonly router = inject(Router);
  /** Az admin oldalakon nincs nyilvános fejléc, lábléc, nyitó animáció és egyedi kurzor. */
  protected readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/admin')),
    ),
    { initialValue: location.pathname.startsWith('/admin') },
  );

  constructor() {
    // A ragadós fejléc ne takarja ki a horgonnyal elért szakasz tetejét.
    inject(ViewportScroller).setOffset([0, 80]);
  }
}
