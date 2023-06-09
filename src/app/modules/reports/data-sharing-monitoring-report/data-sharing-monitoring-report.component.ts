import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-data-sharing-monitoring-report',
  templateUrl: './data-sharing-monitoring-report.component.html',
  styleUrls: ['./data-sharing-monitoring-report.component.css'],
})
export class DataSharingMonitoringReportComponent implements OnInit, OnDestroy {
  db2Data: string[];
  oracleData: string[];
  isWaiting = false;
  subscription = new Subscription();

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.getDataMonitoringReport();
  }

  getDataMonitoringReport(): void {
    this.isWaiting = true;
    this.subscription.add(
      this.reportsService
        .fetchDataSharingMonitorReport()
        .pipe(
          tap((res) => {
            [this.db2Data, this.oracleData] = res;
            this.isWaiting = false;
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
