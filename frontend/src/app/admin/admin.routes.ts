import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

const requireLogin: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  return auth.loggedIn() ? true : inject(Router).createUrlTree(['/admin/login']);
};

const guestOnly: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  return auth.loggedIn() ? inject(Router).createUrlTree(['/admin']) : true;
};

export default [
  {
    path: 'login',
    canActivate: [guestOnly],
    title: 'Bejelentkezés – Done Translations admin',
    loadComponent: () => import('./admin-login').then((m) => m.AdminLogin),
  },
  {
    path: '',
    canActivate: [requireLogin],
    title: 'Ajánlatkérések – Done Translations admin',
    loadComponent: () => import('./admin-dashboard').then((m) => m.AdminDashboard),
  },
] satisfies Routes;
