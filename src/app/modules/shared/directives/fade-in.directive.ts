// src/app/modules/shared/directives/fade-in.directive.ts

import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appFadeIn]',
  standalone: true, // This makes the directive easy to import
})
export class FadeInDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer?.unobserve(entry.target); // Optional: stop observing once visible
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
