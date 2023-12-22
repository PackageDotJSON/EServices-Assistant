import { Component, Input, OnInit } from '@angular/core';
import { NadraAndPmdBillingReportService } from '../../services/nadra-and-pmd-billing-report.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

@Component({
  selector: 'app-pmd-report-table',
  templateUrl: './pmd-report-table.component.html',
  styleUrls: ['./pmd-report-table.component.css'],
})
export class PmdReportTableComponent implements OnInit {
  @Input() startDateKey: Date;
  @Input() endDateKey: Date;
  pmdReport$: Observable<IResponse>;

  constructor(
    private nadraAndPmdBillingService: NadraAndPmdBillingReportService
  ) {}

  ngOnInit(): void {
    this.getPmdReport();
  }

  getPmdReport() {
    this.pmdReport$ = this.nadraAndPmdBillingService.getPmdReport(
      this.startDateKey.toString(),
      this.endDateKey.toString()
    );
  }
}
