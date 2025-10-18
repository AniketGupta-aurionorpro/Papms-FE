import { CanActivateFn } from '@angular/router';

export const forcePasswordChangeGuard: CanActivateFn = (route, state) => {
  return true;
};
