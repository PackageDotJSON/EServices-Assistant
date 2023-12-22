import { Routes } from '@angular/router';
import { NadraReportComponent } from '../pages/nadra-and-pmd-billing-report/nadra-and-pmd-billing-report.component';
import { VendorsComponent } from '../vendors.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: VendorsComponent,
    children: [{ path: 'nadraandpmdbillingreport', component: NadraReportComponent }],
  },
];
