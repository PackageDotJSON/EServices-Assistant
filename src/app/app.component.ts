import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAccess } from './services/login-service/login.service';
import { INITIAL_LOADING_TIME } from './constants/base-url.constant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  timeOut = false;
  showHeaderFooter$: Observable<boolean>;

  constructor(private userAccess: UserAccess) {}

  ngOnInit(): void {
    this.showHeaderFooter$ = this.userAccess.getHeaderFooter();

    if (sessionStorage.getItem('token')) {
      this.timeOut = true;
    } else {
      setTimeout(() => {
        this.timeOut = true;
      }, INITIAL_LOADING_TIME);
    }
  }
}
