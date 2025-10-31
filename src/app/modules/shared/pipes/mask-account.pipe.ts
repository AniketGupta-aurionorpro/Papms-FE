import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskAccount',
  standalone: true // Make it standalone for easy import
})
export class MaskAccountPipe implements PipeTransform {

  transform(value: string | undefined | null, visibleDigits: number = 4): string {
    if (!value || value.length <= visibleDigits) {
      return value || '';
    }

    const maskedPart = '•'.repeat(value.length - visibleDigits);
    const visiblePart = value.slice(-visibleDigits);

    return maskedPart + visiblePart;
  }
}
