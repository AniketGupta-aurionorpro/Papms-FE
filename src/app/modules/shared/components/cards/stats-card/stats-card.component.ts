import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.css'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: string = '';
  @Input() iconBgClass: string = 'bg-slate-500';
  @Input() trend: string = '';
  @Input() trendColor: string = 'text-slate-600';

  getTrendIcon(): string {
    if (this.trend && this.trend.startsWith('-')) {
      return 'trending-down-outline';
    }
    return 'trending-up-outline';
  }
}
