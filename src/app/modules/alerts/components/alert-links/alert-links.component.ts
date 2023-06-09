import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert-links',
  templateUrl: './alert-links.component.html',
  styleUrls: ['./alert-links.component.css'],
})
export class AlertLinksComponent {
  @Output() eventEmitter = new EventEmitter<string>();

  openTab(item: string) {
    this.eventEmitter.emit(item);
  }
}