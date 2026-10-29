import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  template: `
    <main class="adm-login">
      <form class="adm-login-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="adm-brand"><span class="logo-mark" aria-hidden="true">✓</span><span>Done<strong>Translations</strong></span></div>
        <h1>Admin bejelentkezés</h1>
        @if (expired) {
          <p class="adm-info">A bejelentkezés lejárt, kérjük, lépjen be újra.</p>
        }
        <label for="adm-email">E-mail
          <input id="adm-email" type="email" formControlName="email" autocomplete="username" />
        </label>
        <label for="adm-password">Jelszó
          <input id="adm-password" type="password" formControlName="password" autocomplete="current-password" />
        </label>
        @if (error()) {
          <p class="adm-error" role="alert">{{ error() }}</p>
        }
        <button type="submit" class="btn btn-block" [disabled]="busy()">{{ busy() ? 'Belépés…' : 'Belépés' }}</button>
        <a href="/" class="adm-back">← Vissza a weboldalra</a>
      </form>
    </main>
  `,
})
export class AdminLogin {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  protected readonly expired = !!inject(ActivatedRoute).snapshot.queryParamMap.get('lejart');

  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Kérjük, adja meg az e-mail címét és a jelszavát.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/admin'),
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        if (err.status === 422) this.error.set(err.error?.errors?.email?.[0] ?? 'Hibás e-mail cím vagy jelszó.');
        else if (err.status === 429) this.error.set('Túl sok próbálkozás. Kérjük, várjon egy percet.');
        else this.error.set('Nem sikerült kapcsolódni a szerverhez. Próbálja újra.');
      },
    });
  }
}
