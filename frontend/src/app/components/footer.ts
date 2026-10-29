import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../site.config';
import { Icon } from './icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  template: `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div>
          <a routerLink="/" fragment="top" class="logo light">
            <span class="logo-mark" aria-hidden="true">✓</span>
            <span>Done<strong>Translations</strong></span>
          </a>
          <p>Szakfordítás, záradékolt fordítás, lektorálás és tolmácsolás.</p>
        </div>
        <div>
          <h4>Elérhetőség</h4>
          <p>
            <a [href]="site.phoneHref">{{ site.phone }}</a><br />
            <a [href]="'mailto:' + site.email">{{ site.email }}</a><br />
            {{ site.address }}
          </p>
        </div>
        <div>
          <h4>Információ</h4>
          <p><a href="#">Adatkezelési tájékoztató</a><br /><a href="#">ÁSZF</a><br /><a href="#">Impresszum</a></p>
        </div>
      </div>
      <div class="container copyright">© {{ year }} {{ site.name }} · {{ site.company }}</div>
    </footer>

    <!-- Mobilon mindig látható gyorsgombok -->
    <div class="mobile-bar">
      <a [href]="site.phoneHref"><app-icon name="phone" /> Hívás</a>
      <a routerLink="/" fragment="ajanlat" class="primary">Ingyenes ajánlat</a>
    </div>
  `,
})
export class Footer {
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
}
