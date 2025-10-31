import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, take, switchMap, catchError } from 'rxjs/operators';
import { EmployeeService } from '../../../../../services/employee.service';

export class EmployeeValidators {

  static usernameAvailable(employeeService: EmployeeService, organizationId: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500), // wait 500ms after user stops typing
        take(1), // take the first value after debounce
        switchMap(username =>
          employeeService.checkUsernameAvailability(organizationId, username).pipe(
            map(res => (res.isAvailable ? null : { notAvailable: true })),
            catchError(() => of(null)) // on error, don't block the form
          )
        )
      );
    };
  }

  static emailAvailable(employeeService: EmployeeService, organizationId: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500),
        take(1),
        switchMap(email =>
          employeeService.checkEmailAvailability(organizationId, email).pipe(
            map(res => (res.isAvailable ? null : { notAvailable: true })),
            catchError(() => of(null))
          )
        )
      );
    };
  }
}
