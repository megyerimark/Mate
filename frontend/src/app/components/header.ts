import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="site-header" [class.scrolled]="scrolled()">
      <div class="container header-inner">
        <a routerLink="/" fragment="top" class="logo" aria-label="Done Translations – főoldal">
          <span class="logo-mark" aria-hidden="true">✓</span>
          <span>Done<strong>Translations</strong></span>
        </a>
        <nav class="nav" id="nav" [class.open]="open()" aria-label="Fő navigáció">
          @for (link of links; track link.fragment) {
            <a routerLink="/" [fragment]="link.fragment" (click)="open.set(false)">{{ link.label }}</a>
          }
          <a routerLink="/" fragment="ajanlat" class="btn btn-sm" (click)="open.set(false)">Árajánlat kérése</a>
        </nav>
        <button
          class="nav-toggle"
          aria-label="Menü"
          aria-controls="nav"
          [attr.aria-expanded]="open()"
          (click)="open.set(!open())"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `,
})
export class Header {
  protected readonly open = signal(false);
  protected readonly scrolled = signal(false);

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }
  protected readonly links = [
    { fragment: 'szolgaltatasok', label: 'Szolgáltatások' },
    { fragment: 'hogyan', label: 'Hogyan működik' },
    { fragment: 'arak', label: 'Árak' },
    { fragment: 'velemenyek', label: 'Vélemények' },
    { fragment: 'gyik', label: 'GYIK' },
  ];
}
