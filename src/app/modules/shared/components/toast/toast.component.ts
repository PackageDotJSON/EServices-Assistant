import { Component, Input, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit {
  @Input() toastColor: string;
  @Input() toastOperation: string;
  @Input() toastMessage: string;

  constructor() {}

  ngOnInit(): void {
    $('.toast').toast('show');
  }
}
