import { Component, Input, OnInit } from '@angular/core';
import { NadraAndPmdBillingReportService } from '../../services/nadra-and-pmd-billing-report.service';
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
  @Input() userCnic: string;
  @Input() searchType: string;
  pmdReport$: Observable<IResponse>;

  constructor(
    private nadraAndPmdBillingService: NadraAndPmdBillingReportService
  ) {}

  ngOnInit(): void {
    this.getPmdReport();
  }

  getPmdReport() {
    if (this.searchType === 'CNIC') {
      this.pmdReport$ = this.nadraAndPmdBillingService.getPmdReport(
        undefined,
        undefined,
        this.userCnic
      );
    } else {
      this.pmdReport$ = this.nadraAndPmdBillingService.getPmdReport(
        this.startDateKey.toString(),
        this.endDateKey.toString(),
        undefined
      );
    }
  }
}
