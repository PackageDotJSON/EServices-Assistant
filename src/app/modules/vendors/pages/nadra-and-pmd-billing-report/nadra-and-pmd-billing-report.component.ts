import { Component } from '@angular/core';

@Component({
  selector: 'app-nadra-and-pmd-billing-report',
  templateUrl: './nadra-and-pmd-billing-report.component.html',
  styleUrls: ['./nadra-and-pmd-billing-report.component.css'],
})
export class NadraReportComponent {
  startDateKey: Date;
  endDateKey: Date;
  selectedItem: string;
  userCnic: string;
  selectedType = 'Date';
  showCnicError = false;

  selectedItemChange() {
    this.selectedItem = '';
  }
}
