import { Component } from '@angular/core';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../../models/director-details.model';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { CompanyState } from '../../../state-management/company-state.service';
import { tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

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
  isRequestSent = false;
  response$: Observable<IResponse>;

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

  addNewShareholder() {
    this.index = this.shareholderDetails.directorInfo.length;
    this.selectedShareholder = {
      directorAddress: '',
      directorCnicPassport: '',
      directorFatherHusbandName: '',
      directorName: '',
      directorNationality: '',
      designation: 'Shareholder',
    };
  }

  deleteShareholder(i) {
    this.isRequestSent = true;
    this.shareholderDetails.directorInfo.splice(i, 1);
    this.response$ = this.dataCleansingService
      .updateShareholderDetails(this.shareholderDetails)
      .pipe(tap((_) => (this.isRequestSent = false)));
  }

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
