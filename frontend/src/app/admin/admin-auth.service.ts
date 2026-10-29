import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

const TOKEN_KEY = 'dt_admin_token';
const USER_KEY = 'dt_admin_user';

/** Az admin bejelentkezés állapota. A token a böngészőben marad, amíg ki nem lép vagy le nem jár (12 óra). */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(read(TOKEN_KEY));
  readonly user = signal<AdminUser | null>(parse(read(USER_KEY)));
  readonly loggedIn = computed(() => !!this.token());

  login(email: string, password: string): Observable<{ token: string; user: AdminUser }> {
    return this.http
      .post<{ token: string; user: AdminUser }>(`${environment.apiUrl}/api/admin/login`, { email, password })
      .pipe(
        tap(({ token, user }) => {
          this.token.set(token);
          this.user.set(user);
          write(TOKEN_KEY, token);
          write(USER_KEY, JSON.stringify(user));
        }),
      );
  }

  logout(): void {
    if (this.token()) {
      // A szerveren is érvénytelenítjük a tokent; ha ez nem sikerül, helyben akkor is kilépünk.
      this.http.post(`${environment.apiUrl}/api/admin/logout`, {}).subscribe({ error: () => {} });
    }
    this.clear();
  }

  clear(): void {
    this.token.set(null);
    this.user.set(null);
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Privát módban a tároló tilthat: ilyenkor csak erre a lapra marad bejelentkezve.
  }
}

function parse(raw: string | null): AdminUser | null {
  try {
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}
