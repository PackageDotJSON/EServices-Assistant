import { Component } from '@angular/core';

@Component({
  selector: 'app-shareholding-information',
  templateUrl: './shareholding-information.component.html',
  styleUrls: ['./shareholding-information.component.css'],
})
export class ShareholdingInformationComponent {
  isModalClicked = false;

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }
}
