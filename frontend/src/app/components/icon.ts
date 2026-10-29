import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Az oldal saját vonalas ikonjai. A zöld körvonal a fő szín, a `w` osztályú részletek arany.
 * Csak ebben a fájlban rögzített jelölés kerül az innerHTML-be, felhasználói adat soha.
 */
const ICONS: Record<string, string> = {
  document: `
    <path d="M7 3h7l5 5v12.5a.5.5 0 0 1-.5.5h-11.5a.5.5 0 0 1-.5-.5v-17a.5.5 0 0 1 .5-.5z"/>
    <path d="M14 3v5h5"/><path d="M9 11.5h6"/><path d="M9 14.5h3.5"/>
    <circle class="w" cx="15.5" cy="17.5" r="2"/>`,
  legal: `
    <path d="M12 5v15"/><path d="M8 20h8"/><path d="M5 7.5h14"/>
    <path d="M5 7.5l-2.5 5.5a2.5 2.5 0 0 0 5 0z"/><path d="M19 7.5l-2.5 5.5a2.5 2.5 0 0 0 5 0z"/>
    <circle class="w" cx="12" cy="4" r="1.3"/>`,
  technical: `
    <circle cx="12" cy="12" r="3.2"/>
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>
    <circle class="w" cx="12" cy="12" r="1"/>`,
  web: `
    <circle cx="12" cy="12" r="9"/><path d="M12 3a13.5 13.5 0 0 1 0 18"/><path d="M12 3a13.5 13.5 0 0 0 0 18"/>
    <path class="w" d="M3.5 9h17M3.5 15h17"/>`,
  proofread: `
    <circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>
    <path class="w" d="M7.8 10.6l1.9 1.9 3.6-3.8"/>`,
  interpret: `
    <path d="M4 4.5h10.5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"/>
    <path class="w" d="M18.5 8.5H20a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v3l-3-3h-4.5a1 1 0 0 1-1-1v-.5"/>`,
  phone: `<path d="M5 3.5h3l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5L14.5 13l5 2v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>`,
};

@Component({
  selector: 'app-icon',
  template: `<span class="icon-svg" [innerHTML]="svg()"></span>`,
  styles: `
    :host { display: inline-grid; place-items: center; }
    .icon-svg { display: contents; }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[this.name()] ?? ''}</svg>`,
    ),
  );
}
