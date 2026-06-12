import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RevealDirective } from '../../directives/reveal.directive';
import { ArticlesService } from '../../services/articles.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [DatePipe, RevealDirective],
  templateUrl: './posts.component.html',
})
export class PostsComponent implements OnInit {
  private readonly articlesService = inject(ArticlesService);

  articles = signal<Article[]>([]);

  ngOnInit(): void {
    this.articlesService.getArticles().subscribe((articles) => this.articles.set(articles));
  }

  featured(): Article | undefined {
    return this.articles()[0];
  }

  rest(): Article[] {
    return this.articles().slice(1);
  }
}
