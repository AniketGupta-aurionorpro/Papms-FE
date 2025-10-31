import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompleteEmployeeResponse } from '../../../../../models/employee.models';
import { MaskAccountPipe } from '../../../pipes/mask-account.pipe';

@Component({
  selector: 'app-employee-view-modal',
  standalone: true,
  imports: [CommonModule, MaskAccountPipe],
  templateUrl: './employee-view-modal.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmployeeViewModalComponent {
  @Input() employee: CompleteEmployeeResponse | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    const words = name.split(' ').filter(Boolean);
    return words.length > 1
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
}
