import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NadraReportTableComponent } from './components/nadra-report-table/nadra-report-table.component';
import { RouterModule } from '@angular/router';
import { NadraReportComponent } from './pages/nadra-and-pmd-billing-report/nadra-and-pmd-billing-report.component';
import { ROUTES } from './routes/routes.constant';
import { VendorsComponent } from './vendors.component';
import { FormsModule } from '@angular/forms';
import { NadraAndPmdBillingReportService } from './services/nadra-and-pmd-billing-report.service';
import { PmdReportTableComponent } from './components/pmd-report-table/pmd-report-table.component';

@NgModule({
  declarations: [VendorsComponent, NadraReportTableComponent, NadraReportComponent, PmdReportTableComponent],
  imports: [CommonModule, RouterModule.forChild(ROUTES), FormsModule],
  providers: [NadraAndPmdBillingReportService],
})
export class VendorsModule {}
