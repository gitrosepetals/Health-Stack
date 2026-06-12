import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  private readonly theme = inject(ThemeService);

  navOpen = signal(false);
  scrolled = signal(false);

  ngOnInit(): void {
    this.theme.init();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleNav(): void {
    this.navOpen.update((v) => !v);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNav();
  }
}
