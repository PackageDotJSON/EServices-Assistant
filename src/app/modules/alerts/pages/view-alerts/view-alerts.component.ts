import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-view-alerts',
  templateUrl: './view-alerts.component.html',
  styleUrls: ['./view-alerts.component.css'],
})
export class ViewAlertsComponent {
  @Output() eventEmitter = new EventEmitter<string>();

  displayTab(event: string) {
    this.eventEmitter.emit(event);
  }
}
