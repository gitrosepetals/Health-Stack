import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AdminArticlesService } from '../../../services/admin-articles.service';
import { AdminArticle } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly articlesService = inject(AdminArticlesService);

  articles = signal<AdminArticle[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'published' | 'draft'>('all');
  deleting = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const status = this.filter() === 'all' ? undefined : this.filter();
    this.articlesService.list(status).subscribe({
      next: (articles) => {
        this.articles.set(articles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFilter(value: 'all' | 'published' | 'draft'): void {
    this.filter.set(value);
    this.load();
  }

  deleteArticle(article: AdminArticle): void {
    if (!confirm(`Delete "${article.title}"?`)) return;

    const id = article.db_id ?? article.slug;
    this.deleting.set(id);
    this.articlesService.delete(id).subscribe({
      next: () => {
        this.articles.update((list) => list.filter((a) => (a.db_id ?? a.slug) !== id));
        this.deleting.set(null);
      },
      error: () => this.deleting.set(null),
    });
  }
}
