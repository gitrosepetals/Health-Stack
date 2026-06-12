import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminArticlesService } from '../../../services/admin-articles.service';

@Component({
  selector: 'app-admin-article-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css',
})
export class AdminArticleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articlesService = inject(AdminArticlesService);

  isEdit = signal(false);
  articleId = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: [''],
    category: ['', Validators.required],
    summary: ['', Validators.required],
    url: ['#'],
    published_at: [new Date().toISOString().slice(0, 10), Validators.required],
    status: ['draft' as 'draft' | 'published', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.articleId.set(id);
      this.loading.set(true);
      this.articlesService.get(id).subscribe({
        next: (article) => {
          this.form.patchValue({
            title: article.title,
            slug: article.slug,
            category: article.category,
            summary: article.summary,
            url: article.url,
            published_at: article.published_at,
            status: article.status,
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Article not found.');
          this.loading.set(false);
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.error.set('');
    const data = this.form.getRawValue();

    const request$ = this.isEdit()
      ? this.articlesService.update(this.articleId()!, data)
      : this.articlesService.create(data);

    request$.subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err) => {
        this.error.set(err.error?.error ?? 'Failed to save article.');
        this.saving.set(false);
      },
    });
  }
}
