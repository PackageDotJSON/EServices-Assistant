import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-upload-alerts',
  templateUrl: './upload-alerts.component.html',
  styleUrls: ['./upload-alerts.component.css'],
})
export class UploadAlertsComponent {
  @Output() eventEmitter = new EventEmitter<string>();

  displayTab(event: string) {
    this.eventEmitter.emit(event);
  }
}
