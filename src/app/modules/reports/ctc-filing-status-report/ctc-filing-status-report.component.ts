import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserAccess } from '../../../services/login-service/login.service';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import {
  CHANGE_COMPANY_OBJECT_API,
  CHANGE_COMPANY_SECTOR_API,
} from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';
import { ReportsService } from '../services/reports.service';
import {
  CHART_CONFIG,
  CTC_FILING_STATUS_REPORT_FILE,
  FILE_MIME_TYPE,
} from 'src/app/settings/app.settings';
import { Chart, registerables } from 'chart.js';
import { CTC_FILING_STATUS_REPORT_FILE_NAME } from '../../../constants/files-names.constant';
Chart.register(...registerables);

@Component({
  selector: 'app-ctc-filing-status-report',
  templateUrl: './ctc-filing-status-report.component.html',
  styleUrls: ['./ctc-filing-status-report.component.css'],
})
export class CTCFilingStatusReportComponent implements OnInit, OnDestroy {
  ctcTableList: any[] = [];
  ctcTableSummary: any[] = [];
  searchDataKey: string;
  dataNotAvailable = false;
  serverError = false;
  noTokenError = false;
  authFailedError = false;
  writeToExcelAlert = false;
  closed: number;
  submitted: number;
  underSubmission: number;
  isWaiting = false;
  chartData: unknown;
  chartConfig: any;
  myChart: unknown;

  subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private useraccess: UserAccess,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.fetchCTCReportSummary();
    this.fetchCTCReport();
  }

  fetchCTCReportSummary(): void {
    this.isWaiting = true;
    this.subscription.add(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_SECTOR_API.FETCH_CTC_REPORT_SUMMARY)
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
              this.ctcTableSummary.push(response);
              this.ctcTableSummary = this.ctcTableSummary[0];

              this.closed = this.ctcTableSummary[0].TOTAL;
              this.submitted = this.ctcTableSummary[1].TOTAL;
              this.underSubmission = this.ctcTableSummary[2].TOTAL;

              this.setChartData();
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  fetchCTCReport(): void {
    this.isWaiting = true;
    this.ctcTableList = [];
    this.subscription.add(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_SECTOR_API.FETCH_CTC_TABLES)
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
              this.ctcTableList.push(response);
              this.ctcTableList = this.ctcTableList[0];
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  searchCTCReport(): void {
    this.isWaiting = true;
    this.dataNotAvailable = false;
    this.ctcTableList = [];
    const params = new HttpParams().set('id', this.searchDataKey);
    this.subscription.add(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_SECTOR_API.SEARCH_CTC_REPORT, { params })
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
              this.ctcTableList.push(response);
              this.ctcTableList = this.ctcTableList[0];
              if (this.ctcTableList.length === 0) {
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

  setChartData(): void {
    this.chartData = {
      labels: [
        this.ctcTableSummary[0].STATUS,
        this.ctcTableSummary[1].STATUS,
        this.ctcTableSummary[2].STATUS,
      ],
      datasets: [
        {
          data: [
            this.ctcTableSummary[0].TOTAL,
            this.ctcTableSummary[1].TOTAL,
            this.ctcTableSummary[2].TOTAL,
          ],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
          ],
          hoverOffset: 4,
        },
      ],
    };
    this.chartConfig = {
      type: CHART_CONFIG.PIE_CHART,
      data: this.chartData,
      options: {},
    };

    this.myChart = new Chart(
      document.getElementById('myChart') as HTMLCanvasElement,
      this.chartConfig
    );
  }

  exportData(): void {
    this.subscription.add(
      this.reportsService
        .exportData(
          this.ctcTableList,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          CTC_FILING_STATUS_REPORT_FILE_NAME
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
                CTC_FILING_STATUS_REPORT_FILE,
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
