import { Component, Input, OnInit } from '@angular/core';
import { NadraAndPmdBillingReportService } from '../../services/nadra-and-pmd-billing-report.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

@Component({
  selector: 'app-nadra-report-table',
  templateUrl: './nadra-report-table.component.html',
  styleUrls: ['./nadra-report-table.component.css'],
})
export class NadraReportTableComponent implements OnInit {
  @Input() startDateKey: Date;
  @Input() endDateKey: Date;
  nadraReport$: Observable<IResponse>;

  constructor(
    private nadraAndPmdBillingService: NadraAndPmdBillingReportService
  ) {}

  ngOnInit(): void {
    this.getNadraReport();
  }

  getNadraReport() {
    this.nadraReport$ = this.nadraAndPmdBillingService.getNadraReport(
      this.startDateKey.toString(),
      this.endDateKey.toString()
    );
  }
}
