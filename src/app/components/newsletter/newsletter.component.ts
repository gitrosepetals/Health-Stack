import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './newsletter.component.html',
})
export class NewsletterComponent implements AfterViewInit {
  private readonly host = inject(ElementRef);

  ngAfterViewInit(): void {
    const container = this.host.nativeElement.querySelector('.newsletter-embed');
    if (!container) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
    script.setAttribute('data-beehiiv-form', 'acc6204b-fa5f-4da1-8f34-813a7a096fae');
    container.appendChild(script);
  }
}
