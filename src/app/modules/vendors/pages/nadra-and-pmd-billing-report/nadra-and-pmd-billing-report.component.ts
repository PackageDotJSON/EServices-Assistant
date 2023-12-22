import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nadra-and-pmd-billing-report',
  templateUrl: './nadra-and-pmd-billing-report.component.html',
  styleUrls: ['./nadra-and-pmd-billing-report.component.css']
})
export class NadraReportComponent implements OnInit {
  startDateKey: Date;
  endDateKey: Date;
  selectedItem: string;

  constructor() { }

  ngOnInit(): void {
  }

}
