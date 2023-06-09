import { Component } from '@angular/core';
import { ROUTES_URL } from '../../enums/routes.enum';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
  readonly helpUrl = ROUTES_URL.HELP_URL;
}
