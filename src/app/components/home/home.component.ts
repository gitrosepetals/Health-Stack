import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { StatsBarComponent } from '../stats-bar/stats-bar.component';
import { AboutComponent } from '../about/about.component';
import { TopicsComponent } from '../topics/topics.component';
import { PostsComponent } from '../posts/posts.component';
import { NewsletterComponent } from '../newsletter/newsletter.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroComponent,
    StatsBarComponent,
    AboutComponent,
    TopicsComponent,
    PostsComponent,
    NewsletterComponent,
    FooterComponent,
  ],
  template: `
    <app-header />
    <main id="top">
      <app-hero />
      <app-stats-bar />
      <app-about />
      <app-topics />
      <app-posts />
      <app-newsletter />
    </main>
    <app-footer />
  `,
})
export class HomeComponent {}
