import { Component } from '@angular/core';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css'],
})
export class AlertsComponent {
  showViewAlerts = true;
  showUploadAlerts = false;

  displayTab(event: string) {
    return event === 'View Alerts'
      ? ((this.showViewAlerts = true), (this.showUploadAlerts = false))
      : ((this.showUploadAlerts = true), (this.showViewAlerts = false));
  }
}
