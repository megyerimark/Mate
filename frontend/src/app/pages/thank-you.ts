import { Component, OnInit, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SITE } from '../site.config';

@Component({
  selector: 'app-thank-you',
  imports: [RouterLink],
  template: `
    <section class="section center thank-you">
      <div class="container narrow">
        <div class="logo-mark big" aria-hidden="true">✓</div>
        <h1>Köszönjük, megkaptuk!</h1>
        <p class="lead">
          Munkaidőben 1 órán belül jelentkezünk a pontos árajánlattal. A visszaigazolást elküldtük e-mailben is.
          Ha sürgős, hívjon: <a [href]="site.phoneHref">{{ site.phone }}</a>
        </p>
        <a routerLink="/" class="btn btn-lg">Vissza a főoldalra</a>
      </div>
    </section>
  `,
})
export class ThankYou implements OnInit {
  protected readonly site = SITE;
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
}
