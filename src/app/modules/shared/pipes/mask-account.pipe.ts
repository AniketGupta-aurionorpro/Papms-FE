import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskAccount'
})
export class MaskAccountPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
