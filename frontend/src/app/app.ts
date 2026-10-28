import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Cursor } from './components/cursor';
import { Footer } from './components/footer';
import { Header } from './components/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Cursor],
  template: `
    <div class="intro" aria-hidden="true">
      <div class="intro-logo"><span class="logo-mark">✓</span> Done<strong>Translations</strong></div>
    </div>
    <app-cursor />
    <app-header />
    <main id="top"><router-outlet /></main>
    <app-footer />
  `,
})
export class App {
  constructor() {
    // A ragadós fejléc ne takarja ki a horgonnyal elért szakasz tetejét.
    inject(ViewportScroller).setOffset([0, 80]);
  }
}
