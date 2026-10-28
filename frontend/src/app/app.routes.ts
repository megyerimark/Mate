import { Routes } from '@angular/router';
import { Home } from './pages/home';
import { ThankYou } from './pages/thank-you';

export const routes: Routes = [
  { path: '', component: Home, title: 'Done Translations – Gyors, pontos fordítás | Ingyenes árajánlat 1 órán belül' },
  { path: 'koszonjuk', component: ThankYou, title: 'Köszönjük! – Done Translations' },
  { path: '**', redirectTo: '' },
];
