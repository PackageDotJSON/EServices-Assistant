import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES_URL } from 'src/app/enums/routes.enum';
import { UserAccess } from 'src/app/services/login-service/login.service';

@Injectable()
export class LogoutService {
  constructor(private router: Router, private useraccess: UserAccess) {}

  logOut() {
    this.useraccess.accessTypeFull =
      this.useraccess.accessTypePartial =
      this.useraccess.accessTypeMinimum =
        false;
    window.sessionStorage.clear();
    this.useraccess.displayHeaderFooter(false);
    this.router.navigateByUrl(ROUTES_URL.LOGIN_URL);
  }
}
