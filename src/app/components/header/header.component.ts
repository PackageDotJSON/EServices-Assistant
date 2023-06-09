import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAccess } from '../../services/login-service/login.service';
import { Router } from '@angular/router';
import { ROUTES_URL } from 'src/app/enums/routes.enum';
import { HeaderService } from 'src/app/services/header-service/header.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userA = false;
  userB = false;
  userC = false;
  noTokenError = false;
  authFailedError = false;
  routes: any = ['/records', '/process', '/companyuser'];
  serverError = false;

  readonly homeUrl = ROUTES_URL.HOME_URL;
  readonly applicationManagementUrl = ROUTES_URL.APPLICATION_MANAGEMENT_URL;
  readonly eservicesManagementUrl = ROUTES_URL.ESERVICES_MANAGEMENT_URL;
  readonly helpUrl = ROUTES_URL.HELP_URL;
  readonly logoutUrl = ROUTES_URL.LOG_OUT_URL;
  readonly userprofileUrl = ROUTES_URL.USER_PROFILE;
  readonly requestLogUrl = ROUTES_URL.REQUEST_LOG_URL;
  readonly ioscoAlertsUrl = ROUTES_URL.IOSCO_ALERTS_URL;

  subscription = new Subscription();

  constructor(
    private useraccess: UserAccess,
    private router: Router,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    if (sessionStorage.getItem('accessTypeFull') === 'true') {
      this.userA = true;
      this.userB = this.userC = false;
    } else if (sessionStorage.getItem('accessTypePartial') === 'true') {
      this.userB = true;
      this.userA = this.userC = false;
    } else if (sessionStorage.getItem('accessTypeMinimum') === 'true') {
      this.userC = true;
      this.userA = this.userB = false;
    }
    this.fetchUserRights();
  }

  fetchUserRights(): void {
    this.subscription.add(
      this.headerService.fetchUserRights().subscribe(
        (responseData) => {
          if (JSON.stringify(responseData).includes('No Token Provided')) {
            this.noTokenError = true;
          } else if (
            JSON.stringify(responseData).includes(
              'Authorization Failed. Token Expired. Please Login Again.'
            )
          ) {
            this.authFailedError = true;
            setTimeout(() => {
              this.useraccess.accessTypeFull = false;
              this.useraccess.accessTypePartial = false;
              this.useraccess.accessTypeMinimum = false;
              window.sessionStorage.clear();
              this.router.navigateByUrl(ROUTES_URL.LOGIN_URL);
              location.reload();
            }, 2000);
          } else {
            this.routes = responseData;
            for (const index of responseData.keys()) {
              this.routes[index].routes =
                ROUTES_URL.REPORTS_URL + this.routes[index].routes;
            }
          }
        },
        (error) => {
          this.serverError = true;
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
