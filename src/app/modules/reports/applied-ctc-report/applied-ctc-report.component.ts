import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserAccess } from '../../../services/login-service/login.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import {
  CHANGE_COMPANY_OBJECT_API,
  DEACTIVATE_COMPANY_API,
} from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';
import { ReportsService } from '../services/reports.service';
import {
  APPLIED_CTC_REPORT_FILE,
  FILE_MIME_TYPE,
} from 'src/app/settings/app.settings';
import { APPLIED_CTC_REPORT_FILE_NAME } from '../../../constants/files-names.constant';

@Component({
  selector: 'app-applied-ctc-report',
  templateUrl: './applied-ctc-report.component.html',
  styleUrls: ['./applied-ctc-report.component.css'],
})
export class AppliedCTCReportComponent implements OnInit, OnDestroy {
  ctcTableData: any[] = [];
  dataNotAvailable = false;
  noTokenError = false;
  authFailedError = false;
  serverError = false;
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
    this.searchAppliedCTCReport();
  }

  searchAppliedCTCReport(): void {
    this.isWaiting = true;
    this.dataNotAvailable = false;
    this.ctcTableData = [];
    this.subscription.add(
      this.http
        .get(BASE_URL + DEACTIVATE_COMPANY_API.FETCH_APPLIED_CTC_TABLE)
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
              this.ctcTableData.push(response);
              this.ctcTableData = this.ctcTableData[0];

              if (this.ctcTableData.length === 0) {
                this.dataNotAvailable = true;
              }
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  exportData(): void {
    this.subscription.add(
      this.reportsService
        .exportData(
          this.ctcTableData,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          APPLIED_CTC_REPORT_FILE_NAME
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
                APPLIED_CTC_REPORT_FILE,
                CHANGE_COMPANY_OBJECT_API.DOWNLOAD_EXCEL_FILE
              )
              .pipe(
                tap((res) => {
                  this.reportsService.downloadFileToDesktop(
                    res,
                    FILE_MIME_TYPE
                  );
                })
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
