import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './stats-bar.component.html',
})
export class StatsBarComponent {}
