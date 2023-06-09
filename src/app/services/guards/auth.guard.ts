import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { UserAccess } from '../login-service/login.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: UserAccess) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (
      sessionStorage.getItem('accessTypeFull') === 'true' ||
      sessionStorage.getItem('accessTypePartial') === 'true' ||
      sessionStorage.getItem('accessTypeMinimum') === 'true'
    ) {
      this.auth.displayHeaderFooter(true);
      return true;
    }

    return false;
  }
}
