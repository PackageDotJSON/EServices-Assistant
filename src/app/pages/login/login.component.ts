import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { UserAccess } from '../../services/login-service/login.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BASE_URL } from '../../constants/base-url.constant';
import { LOGIN_API } from '../../enums/apis.enum';
import { ROUTES_URL } from 'src/app/enums/routes.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('Enter', [
      state('flyIn', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        style({ transform: 'translateX(-300%)' }),
        animate('1.0s ease-out'),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnDestroy {
  check = false;
  unAuthorized = false;
  serverError = false;
  isLoading = false;
  readonly forgotPasswordUrl = ROUTES_URL.FORGOT_PASSWORD_URL;
  isMailInvalid = false;
  isPasscodeInvalid = false;

  subscription = new Subscription();

  constructor(
    private router: Router,
    private http: HttpClient,
    private useraccess: UserAccess,
    private httpBackend: HttpBackend
  ) {
    this.http = new HttpClient(httpBackend);
  }

  onSubmit(form: NgForm): void {
    const { usermail, passcode } = form.value;
    const regex = /^[a-zA-Z0-9._%+-]+@secp\.gov\.pk$/;

    if (usermail.length > 50 || usermail.length < 15) {
      this.isMailInvalid = true;
      this.isPasscodeInvalid = false;
      return;
    } else if (passcode.length > 40 || passcode.length < 5) {
      this.isPasscodeInvalid = true;
      this.isMailInvalid = false;
      return;
    } else if (!regex.test(usermail)) {
      this.isMailInvalid = true;
      this.isPasscodeInvalid = false;
      return;
    } else {
      this.isMailInvalid = this.isPasscodeInvalid = false;
    }
    this.isLoading = true;
    this.unAuthorized = false;
    this.subscription.add(
      this.http
        .post(BASE_URL + LOGIN_API.LOGIN_API, form.value, {
          observe: 'response',
          responseType: 'text',
        })
        .subscribe(
          (responseData) => {
            this.serverError = false;
            sessionStorage.setItem(
              'token',
              responseData.headers.get('x-access-token')
            );
            this.isLoading = false;
            sessionStorage.setItem('cookie', form.value.usermail);
            const jsonName = JSON.parse(responseData.body);
            sessionStorage.setItem('location', jsonName.location);
            sessionStorage.setItem('user', jsonName);
            if (JSON.stringify(responseData).includes('Full Authorization')) {
              this.unAuthorized = false;
              this.check = true;
              this.useraccess.fullUserAccess();
              this.useraccess.displayHeaderFooter(true);
              this.router.navigateByUrl(ROUTES_URL.HOME_URL);
            } else if (
              JSON.stringify(responseData).includes('Partial Authorization')
            ) {
              this.unAuthorized = false;
              this.check = true;
              this.useraccess.partialUserAccess();
              this.useraccess.displayHeaderFooter(true);
              this.router.navigateByUrl(ROUTES_URL.HOME_URL);
            } else if (
              JSON.stringify(responseData).includes('Minimum Authorization')
            ) {
              this.unAuthorized = false;
              this.check = true;
              this.useraccess.minimumUserAccess();
              this.useraccess.displayHeaderFooter(true);
              this.router.navigateByUrl(ROUTES_URL.HOME_URL);
            } else {
              this.unAuthorized = true;
              this.useraccess.displayHeaderFooter(false);
            }
          },
          (error) => {
            this.serverError = true;
            this.useraccess.displayHeaderFooter(false);
          }
        )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
