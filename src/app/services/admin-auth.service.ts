import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AdminUser, LoginResponse } from '../models/admin.model';

const TOKEN_KEY = 'lumen_admin_token';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly admin = signal<AdminUser | null>(null);
  readonly loading = signal(false);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    this.loading.set(true);
    return this.http.post<LoginResponse>('/api/admin/auth/login', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this.admin.set(res.admin);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        throw err;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.admin.set(null);
    this.router.navigate(['/admin/login']);
  }

  loadSession(): Observable<AdminUser | null> {
    if (!this.token) {
      this.admin.set(null);
      return of(null);
    }

    return this.http.get<{ admin: AdminUser }>('/api/admin/auth/me').pipe(
      map((res) => res.admin),
      tap((admin) => this.admin.set(admin)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }
}
