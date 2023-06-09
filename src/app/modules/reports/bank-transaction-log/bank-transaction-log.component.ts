import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAccess } from '../../../services/login-service/login.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import {
  BANK_COMPANY_LOG_API,
  CHANGE_COMPANY_OBJECT_API,
} from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';
import { ReportsService } from '../services/reports.service';
import {
  BANK_TRANSACTION_LOG_FILE,
  FILE_MIME_TYPE,
} from 'src/app/settings/app.settings';
import { BANK_TRANSACTION_LOG_FILE_NAME } from '../../../constants/files-names.constant';

@Component({
  selector: 'app-bank-transaction-log',
  templateUrl: './bank-transaction-log.component.html',
  styleUrls: ['./bank-transaction-log.component.css'],
})
export class BankTransactionLogComponent implements OnInit, OnDestroy {
  bankData: any[] = [];
  searchedBankData: any[] = [];
  allowEntity = false;
  allowDate = false;
  hasSearchedData = false;
  dataUnavailable = false;
  serverError = false;
  noTokenError = false;
  authFailedError = false;
  searchDataKey: string;
  startDateKey: string;
  endDateKey: string;
  enabledByDefault = true;
  writeToExcelAlert = false;
  isWaiting = false;

  subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private useraccess: UserAccess,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.fetchBankLogData();
  }

  searchEntity(): void {
    this.startDateKey = '';
    this.endDateKey = '';
    this.allowEntity = true;
    this.allowDate = false;
    this.enabledByDefault = true;
  }

  searchDate(): void {
    this.searchDataKey = '';
    this.allowDate = true;
    this.allowEntity = false;
    this.enabledByDefault = false;
  }

  fetchBankLogData(): void {
    this.isWaiting = true;
    this.subscription.add(
      this.http
        .get(BASE_URL + BANK_COMPANY_LOG_API.FETCH_BANK_DATA)
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
              return responseData;
            }
          })
        )
        .subscribe(
          (response) => {
            if (this.noTokenError === false && this.authFailedError === false) {
              this.bankData.push(response);
              this.bankData = this.bankData[0];
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  searchBankLogDataEntity(): void {
    this.isWaiting = true;
    this.dataUnavailable = false;
    this.searchedBankData = [];
    const params = new HttpParams().set('id', this.searchDataKey);

    this.subscription.add(
      this.http
        .get(BASE_URL + BANK_COMPANY_LOG_API.SEARCH_BANK_DATA_ENTITY, {
          params,
        })
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
              return responseData;
            }
          })
        )
        .subscribe(
          (response) => {
            if (this.noTokenError === false && this.authFailedError === false) {
              this.searchedBankData.push(response);
              this.searchedBankData = this.searchedBankData[0];
              if (this.searchedBankData.length === 0) {
                this.dataUnavailable = true;
              }
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
    this.hasSearchedData = true;
  }

  searchBankLogDataDate(): void {
    this.isWaiting = true;
    this.dataUnavailable = false;
    this.searchedBankData = [];
    const params = new HttpParams()
      .set('id', this.startDateKey)
      .set('id2', this.endDateKey);

    this.subscription.add(
      this.http
        .get(BASE_URL + BANK_COMPANY_LOG_API.SEARCH_BANK_DATA_DATE, { params })
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
              return responseData;
            }
          })
        )
        .subscribe(
          (response) => {
            if (this.noTokenError === false && this.authFailedError === false) {
              this.searchedBankData.push(response);
              this.searchedBankData = this.searchedBankData[0];
              if (this.searchedBankData.length === 0) {
                this.dataUnavailable = true;
              }
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
    this.hasSearchedData = true;
  }

  exportData(): void {
    const dataToSend = this.bankData.splice(0, this.bankData.length / 10);
    this.subscription.add(
      this.reportsService
        .exportData(
          dataToSend,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          BANK_TRANSACTION_LOG_FILE_NAME
        )
        .pipe(
          tap((res) => {
            if (JSON.stringify(res).includes('Written to Excel Successfully')) {
              this.writeToExcelAlert = true;
            }
          }),
          switchMap(() =>
            this.reportsService
              .downloadExcelFile(
                BANK_TRANSACTION_LOG_FILE,
                CHANGE_COMPANY_OBJECT_API.DOWNLOAD_EXCEL_FILE
              )
              .pipe(
                tap((res) =>
                  this.reportsService.downloadFileToDesktop(res, FILE_MIME_TYPE)
                )
              )
          )
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
