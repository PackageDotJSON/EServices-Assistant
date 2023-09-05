import { Component } from '@angular/core';
import { LogoutService } from 'src/app/services/logout-service/logout.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
  constructor(private logoutService: LogoutService) {
    this.logoutService.logOut();
  }
}
