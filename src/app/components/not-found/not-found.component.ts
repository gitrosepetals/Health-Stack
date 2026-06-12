import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, RevealDirective],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent implements OnInit {
  private readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.init();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
