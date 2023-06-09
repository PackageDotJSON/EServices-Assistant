import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { tap } from 'rxjs/operators';
import { ForgotPasswordService } from 'src/app/services/forgot-password-service/forgot-password.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES_URL } from 'src/app/enums/routes.enum';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
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
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  userEmail: string;
  emailIsValid = false;
  dataReceived = false;
  verificationCode: number;
  isVerificationCodeValid = false;
  verificationCodeReceived = false;
  newPassword = undefined;
  verifyNewPassword = null;
  passwordError: string;
  readonly loginUrl = ROUTES_URL.LOGIN_URL;

  subscription = new Subscription();

  constructor(
    private password: ForgotPasswordService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          tap((res) => {
            if (res) {
              this.isVerificationCodeValid =
                this.verificationCodeReceived =
                this.emailIsValid =
                  res.verificationcodevalid;
              this.userEmail = res.useremail;
              sessionStorage.setItem('token', res.token);
            }
          })
        )
        .subscribe()
    );
  }

  onForgotPasswordSubmit(): void {
    if (this.dataReceived === true && this.emailIsValid === true) {
      return;
    }

    if (this.newPassword?.length > 0) {
      return;
    }

    const payload = {
      userEmail: this.userEmail,
    };
    this.subscription.add(
      this.password
        .forgotPassword(payload)
        .pipe(
          tap((res) => {
            this.dataReceived = true;
            res.includes('Email found')
              ? (this.emailIsValid = true)
              : (this.emailIsValid = false);
          })
        )
        .subscribe()
    );
  }

  submitVerificationCode(): void {
    if (
      this.dataReceived === false ||
      this.emailIsValid === false ||
      this.isVerificationCodeValid
    ) {
      return;
    }

    const payload = {
      verificationCode: this.verificationCode,
    };
    this.subscription.add(
      this.password
        .verifyCode(payload)
        .pipe(
          tap((res) => {
            this.verificationCodeReceived = true;
            res.includes('Verified')
              ? (this.isVerificationCodeValid = true)
              : (this.isVerificationCodeValid = false);
          })
        )
        .subscribe()
    );
  }

  submitNewPassword(): void {
    if (this.newPassword !== this.verifyNewPassword) {
      this.isVerificationCodeValid &&
        (this.passwordError = 'Passwords do not match');
      return;
    }
    if (this.newPassword?.length < 8) {
      this.isVerificationCodeValid &&
        (this.passwordError =
          'Password length should be minimum of 8 characters');
      return;
    }

    const payload = {
      name: 'password',
      password: this.newPassword,
      email: this.userEmail,
    };

    this.subscription.add(
      this.password
        .createNewPassword(payload)
        .pipe(
          tap((res) => {
            res.includes('Data updated successfully')
              ? this.router.navigateByUrl(ROUTES_URL.LOGIN_URL)
              : (this.passwordError = res);
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
