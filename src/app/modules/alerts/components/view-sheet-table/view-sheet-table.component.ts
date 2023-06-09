import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IResponse } from '../../models/response.model';
import { ISheetTable } from '../../models/sheet-table.model';
import { AlertsService } from '../../services/alerts.service';
import { DownloadFileService } from '../../services/download-file.service';
import { ALERT_FILE_SETTINGS } from '../../settings/alerts.settings';

@Component({
  selector: 'app-view-sheet-table',
  templateUrl: './view-sheet-table.component.html',
  styleUrls: ['./view-sheet-table.component.css'],
})
export class ViewSheetTableComponent implements OnInit, OnDestroy {
  sheetData$: Observable<ISheetTable[]>;
  serverResponse$: Observable<IResponse>;
  subscription = new Subscription();

  constructor(
    private alertService: AlertsService,
    private downloadFileService: DownloadFileService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.sheetData$ = this.alertService.getSheet().pipe(
      map((res: IResponse) => {
        return res.data as ISheetTable[];
      })
    );
  }

  deleteSheet(alertName: string) {
    this.serverResponse$ = this.alertService.deleteSheet(alertName).pipe(
      tap((res) => {
        if (res) {
          this.fetchData();
        }
      })
    );
  }

  downloadSheet(alertName: string) {
    this.subscription.add(
      this.alertService
        .downloadSheet(alertName)
        .pipe(
          tap((res: Blob) => {
            this.downloadFileService.downloadFileToDesktop(
              res,
              ALERT_FILE_SETTINGS.TYPE
            );
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
