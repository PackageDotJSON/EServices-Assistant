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

  isValidCnic() {
    if (this.selectedType !== 'Date') {
      const regex = /^(?=(?:\D*\d){13,15}\D*$)[\d-]+$/;
      const isValid = regex.test(this.userCnic);
      console.log(this.userCnic.length);
      if (!isValid) {
        this.showCnicError = true;
      } else {
        this.showCnicError = false;
      }
    } else {
      this.showCnicError = false;
    }
  }
}
