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

  isValidCnic(button: string) {
    if (this.selectedType === 'CNIC') {
      const regex = /\b\d{13}\b/;
      const isValid = regex.test(this.userCnic);

      if (!isValid) {
        this.showCnicError = true;
        return;
      } else {
        this.showCnicError = false;
      }
    } else {
      this.showCnicError = false;
    }

    this.selectedItem = button;
  }
}
