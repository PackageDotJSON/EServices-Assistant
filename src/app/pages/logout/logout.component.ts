import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES_URL } from 'src/app/enums/routes.enum';
import { UserAccess } from '../../services/login-service/login.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
  constructor(private router: Router, private useraccess: UserAccess) {
    this.useraccess.accessTypeFull = false;
    this.useraccess.accessTypePartial = false;
    this.useraccess.accessTypeMinimum = false;
    window.sessionStorage.clear();
    this.useraccess.displayHeaderFooter(false);
    this.router.navigateByUrl(ROUTES_URL.LOGIN_URL);
  }
}
