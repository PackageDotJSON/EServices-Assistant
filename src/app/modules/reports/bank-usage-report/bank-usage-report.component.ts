import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CHANGE_COMPANY_OBJECT_API } from 'src/app/enums/apis.enum';
import { ReportsService } from '../services/reports.service';
import { switchMap, tap } from 'rxjs/operators';
import {
  BANK_USAGE_REPORT_FILE,
  END_KEY,
  FILE_MIME_TYPE,
  START_KEY,
} from 'src/app/settings/app.settings';
import { BANK_USAGE_REPORT_FILE_NAME } from '../../../constants/files-names.constant';

@Component({
  selector: 'app-bank-usage-report',
  templateUrl: './bank-usage-report.component.html',
  styleUrls: ['./bank-usage-report.component.css'],
})
export class BankusagereportComponent implements OnInit, OnDestroy {
  bankUsageReport$: Observable<any>;
  bankUsageReport: string[];
  writeToExcelAlert = false;
  isWaiting = false;
  startDateKey = START_KEY;
  endDateKey = END_KEY;

  subscription = new Subscription();

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.getBankUsageReport();
  }

  getBankUsageReport(): void {
    this.isWaiting = true;
    const payload = {
      startDate: this.startDateKey,
      endDate: this.endDateKey,
    };
    this.bankUsageReport$ = this.reportsService.fetchBankUsageReport(payload);
    this.subscription.add(
      this.bankUsageReport$
        .pipe(
          tap((res) => ((this.bankUsageReport = res), (this.isWaiting = false)))
        )
        .subscribe()
    );
  }

  exportData(): void {
    this.subscription.add(
      this.reportsService
        .exportData(
          this.bankUsageReport,
          CHANGE_COMPANY_OBJECT_API.EXPORT_TO_EXCEL,
          BANK_USAGE_REPORT_FILE_NAME
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
                BANK_USAGE_REPORT_FILE,
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
