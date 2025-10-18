import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FadeInDirective } from '../../modules/shared/directives/fade-in.directive'; // <-- IMPORT THE DIRECTIVE

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FadeInDirective], // <-- ADD THE DIRECTIVE HERE
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent {

  constructor(private router: Router) {}

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
