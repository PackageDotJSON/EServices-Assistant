import { Component } from '@angular/core';
import { IDirectorDetails, ISingleDirector } from '../../../models/director-details.model';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { CompanyState } from '../../../state-management/company-state.service';
import { tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shareholding-information',
  templateUrl: './shareholding-information.component.html',
  styleUrls: ['./shareholding-information.component.css'],
})
export class ShareholdingInformationComponent {
  isModalClicked = false;
  subscription = new Subscription();
  cuin: string;
  shareholderDetails: IDirectorDetails;
  selectedShareholder: ISingleDirector;
  index: number;

  constructor(
    private dataCleansingService: DataCleansingService,
    private companyStateService: CompanyState
  ) {
    this.subscription.add(
      this.companyStateService
        .getCompany()
        .pipe(
          tap((res: string) => {
            this.cuin = res;
          })
        )
        .subscribe()
    );
  }

  ngOnInit(): void {
    this.getShareholderData();
  }

  getShareholderData() {
    this.subscription.add(
      this.dataCleansingService
        .getShareholderDetails(this.cuin)
        .pipe(
          tap((res: IDirectorDetails) => {
            this.shareholderDetails = res;
          })
        )
        .subscribe()
    );
  }

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
