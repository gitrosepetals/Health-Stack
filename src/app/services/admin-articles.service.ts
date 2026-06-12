import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminArticle } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminArticlesService {
  private readonly http = inject(HttpClient);

  list(status?: string): Observable<AdminArticle[]> {
    const options = status ? { params: { status } } : {};
    return this.http
      .get<{ articles: AdminArticle[] }>('/api/admin/articles', options)
      .pipe(map((r) => r.articles));
  }

  get(id: string): Observable<AdminArticle> {
    return this.http
      .get<{ article: AdminArticle }>(`/api/admin/articles/${id}`)
      .pipe(map((r) => r.article));
  }

  create(data: Partial<AdminArticle>): Observable<AdminArticle> {
    return this.http
      .post<{ article: AdminArticle }>('/api/admin/articles', data)
      .pipe(map((r) => r.article));
  }

  update(id: string, data: Partial<AdminArticle>): Observable<AdminArticle> {
    return this.http
      .put<{ article: AdminArticle }>(`/api/admin/articles/${id}`, data)
      .pipe(map((r) => r.article));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/admin/articles/${id}`);
  }
}
