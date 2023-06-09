import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserAccess } from '../../../services/login-service/login.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { CHANGE_COMPANY_OBJECT_API } from '../../../enums/apis.enum';
import { Subscription } from 'rxjs';
import {
  CHART_CONFIG,
  FILE_MIME_TYPE,
  PROCESS_ERROR_FILE,
} from 'src/app/settings/app.settings';
import { ReportsService } from '../services/reports.service';
import { Chart } from 'chart.js';
import { PROCESS_ERROR_FILE_NAME } from '../../../constants/files-names.constant';

@Component({
  selector: 'app-process-report-status-wise',
  templateUrl: './process-report-status-wise.component.html',
  styleUrls: ['./process-report-status-wise.component.css'],
})
export class ProcessReportStatusWiseComponent implements OnInit, OnDestroy {
  proceedsData: any[] = [];
  processData: any[] = [];
  proceedsError: number;
  processError: number;
  serverError = false;
  noTokenError = false;
  authFailedError = false;
  writeToExcelAlert = false;
  countComplete = 0;
  countCRCS = 0;
  countGenerate = 0;
  countRectification = 0;
  countExamine = 0;
  countMark = 0;
  countIncorporate = 0;
  countReject = 0;
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
    this.fetchErrorProceedData();
    this.fetchErrorProcessData();
  }

  fetchErrorProceedData(): void {
    this.isWaiting = true;
    this.subscription.add(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_OBJECT_API.FETCH_ERROR_PROCEED_DATA)
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
              this.proceedsData.push(response);
              this.proceedsData = this.proceedsData[0];
              this.proceedsError = this.proceedsData.length;
              this.fetchErrorTypes();
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  fetchErrorProcessData(): void {
    this.isWaiting = true;
    this.subscription.add(
      this.http
        .get(BASE_URL + CHANGE_COMPANY_OBJECT_API.FETCH_ERROR_PROCESS_DATA)
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
              this.processData.push(response);
              this.processData = this.processData[0];
              this.processError = this.processData.length;
            }
            this.isWaiting = false;
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  fetchErrorTypes(): void {
    for (const i of this.proceedsData.keys()) {
      if (this.proceedsData[i].NAME === 'Complete Process') {
        this.countComplete++;
      } else if (this.proceedsData[i].NAME === 'Complete CRCS Integration') {
        this.countCRCS++;
      } else if (this.proceedsData[i].NAME === 'Generate Filing Certificate') {
        this.countGenerate++;
      } else if (this.proceedsData[i].NAME === 'Rectification') {
        this.countRectification++;
      } else if (this.proceedsData[i].NAME === 'Examine Form') {
        this.countExamine++;
      } else if (this.proceedsData[i].NAME === 'Mark for Resolution') {
        this.countMark++;
      } else if (this.proceedsData[i].NAME === 'Incorporate Company UPES') {
        this.countIncorporate++;
      } else if (this.proceedsData[i].NAME === 'Reject') {
        this.countReject++;
      }
    }
    this.setChartData();
  }

  setChartData(): void {
    this.chartData = {
      labels: [
        'Examine Documents',
        'Issue Resolution',
        'Examine Form',
        'Rectification',
        ['Perform Availability', 'Search'],
        ['Prepare & Print', 'Resolution Letter'],
        'Give Advice',
        ['Issue Show Cause', 'Letter'],
      ],
      datasets: [
        {
          data: [
            this.countComplete,
            this.countCRCS,
            this.countGenerate,
            this.countRectification,
            this.countExamine,
            this.countMark,
            this.countIncorporate,
            this.countReject,
          ],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgba(10, 199, 108)',
            'rgba(111, 10, 199)',
            'rgba(199, 10, 101)',
            'rgba(199, 117, 10)',
            'rgba(199, 168, 10)',
          ],
          hoverOffset: 4,
        },
      ],
    };
    this.chartConfig = {
      type: CHART_CONFIG.PIE_CHART,
      data: this.chartData,
      options: {
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 18, // set the padding to 10 pixels
              usePointStyle: true // use point style for the labels
            }
          },
        },
      },
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
          this.proceedsData,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          PROCESS_ERROR_FILE_NAME
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
                PROCESS_ERROR_FILE,
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
