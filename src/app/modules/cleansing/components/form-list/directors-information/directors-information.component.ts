import { Component } from '@angular/core';

@Component({
  selector: 'app-directors-information',
  templateUrl: './directors-information.component.html',
  styleUrls: ['./directors-information.component.css'],
})
export class DirectorsInformationComponent {
  isModalClicked = false;

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }
}
