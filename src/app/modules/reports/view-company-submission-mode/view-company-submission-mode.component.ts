import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UserAccess } from '../../../services/login-service/login.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { PRODUCTS_API } from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-company-submission-mode',
  templateUrl: './view-company-submission-mode.component.html',
  styleUrls: ['./view-company-submission-mode.component.css'],
})
export class ViewCompanySubmissionModeComponent implements OnDestroy {
  dataAvailable = false;
  dataUnAvailable = false;
  checkCompany = true;
  checkIncorporation = false;
  companyName: string;
  incorporationNumber: number;
  companyData: any[] = [];
  displayincorpData = true;
  displaycompanyData = true;
  serverError = false;
  noTokenError = false;
  authFailedError = false;
  enabledByDefault = true;
  isWaiting = false;

  subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private useraccess: UserAccess,
    private router: Router
  ) {}

  companySelect(): void {
    this.companyData = [];
    this.checkCompany = true;
    this.checkIncorporation = false;
    this.enabledByDefault = true;
  }

  incorporationSelect(): void {
    this.companyData = [];
    this.checkIncorporation = true;
    this.checkCompany = false;
    this.enabledByDefault = false;
  }

  processList(): void {
    if (this.companyName === '' || this.companyName === undefined) {
      this.processListByNum();
    } else if (this.incorporationNumber == null) {
      this.processListByCompany();
    }
  }

  processListByCompany(): void {
    this.isWaiting = true;
    const params = new HttpParams().set('id', this.companyName);
    this.companyData = [];
    this.subscription.add(
      this.http
        .get<{ [key: string]: any }>(
          BASE_URL + PRODUCTS_API.PROCESS_LIST_BY_COMPANY_NAME,
          { params }
        )
        .pipe(
          map((responseData) => {
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
                this.router.navigateByUrl('/');
                location.reload();
              }, 2000);
            } else {
              return responseData.rows;
            }
          })
        )
        .subscribe(
          (posts) => {
            if (this.authFailedError === false && this.noTokenError === false) {
              this.companyData.push(posts);

              if (this.companyData[0].length !== 0) {
                this.dataAvailable = true;
                this.dataUnAvailable = false;
              } else {
                this.dataUnAvailable = true;
                this.dataAvailable = false;
              }
              this.companyName = '';
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  processListByNum(): void {
    this.isWaiting = true;
    const test = JSON.stringify(this.incorporationNumber);
    const params = new HttpParams().set('id', test);
    this.companyData = [];

    this.subscription.add(
      this.http
        .get<{ [key: string]: any }>(
          BASE_URL + PRODUCTS_API.PROCESS_LIST_BY_NUMBER,
          { params }
        )
        .pipe(
          map((responseData) => {
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
                this.router.navigateByUrl('/');
                location.reload();
              }, 2000);
            } else {
              return responseData.rows;
            }
          })
        )
        .subscribe(
          (posts) => {
            if (this.authFailedError === false && this.noTokenError === false) {
              this.companyData.push(posts);

              if (this.companyData[0].length !== 0) {
                this.dataAvailable = true;
                this.dataUnAvailable = false;
              } else {
                this.dataUnAvailable = true;
                this.dataAvailable = false;
              }
              this.incorporationNumber = null;
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  hideCard(): void {
    this.displayincorpData = false;
    this.displaycompanyData = false;
  }

  showCard(): void {
    this.displayincorpData = true;
    this.displaycompanyData = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
