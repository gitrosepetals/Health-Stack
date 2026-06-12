import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './topics.component.html',
})
export class TopicsComponent {}
