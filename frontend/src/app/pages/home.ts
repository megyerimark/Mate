import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuoteForm } from '../components/quote-form';
import { RevealDirective } from '../directives/reveal.directive';
import {
  FAQ, LANGUAGES, PRICES, REASONS, SERVICES, SITE, STATS, STEPS, TESTIMONIALS,
} from '../site.config';

@Component({
  selector: 'app-home',
  imports: [RouterLink, QuoteForm, RevealDirective],
  templateUrl: './home.html',
})
export class Home {
  protected readonly site = SITE;
  protected readonly stats = STATS;
  protected readonly services = SERVICES;
  protected readonly languages = LANGUAGES;
  protected readonly steps = STEPS;
  protected readonly prices = PRICES;
  protected readonly reasons = REASONS;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly faq = FAQ;
}
