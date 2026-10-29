import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

/** Az admin API hívásokhoz hozzáteszi a tokent; ha lejárt, visszaküld a bejelentkezéshez. */
export const adminInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/admin/')) return next(req);

  const auth = inject(AdminAuthService);
  const router = inject(Router);
  const token = auth.token();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }) : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/api/admin/login')) {
        auth.clear();
        router.navigate(['/admin/login'], { queryParams: { lejart: 1 } });
      }
      return throwError(() => err);
    }),
  );
};
