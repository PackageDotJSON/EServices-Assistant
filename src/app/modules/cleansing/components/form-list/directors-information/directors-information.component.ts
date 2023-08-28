import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { Observable, Subscription } from 'rxjs';
import { CompanyState } from '../../../state-management/company-state.service';
import { tap } from 'rxjs/operators';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../../models/director-details.model';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

@Component({
  selector: 'app-directors-information',
  templateUrl: './directors-information.component.html',
  styleUrls: ['./directors-information.component.css'],
})
export class DirectorsInformationComponent implements OnInit, OnDestroy {
  isModalClicked = false;
  subscription = new Subscription();
  cuin: string;
  directorDetails: IDirectorDetails;
  selectedDirector: ISingleDirector;
  index: number;
  response$: Observable<IResponse>;
  isRequestSent = false;

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
    this.getDirectorData();
  }

  getDirectorData() {
    this.subscription.add(
      this.dataCleansingService
        .getDirectorDetails(this.cuin)
        .pipe(
          tap((res: IDirectorDetails) => {
            this.directorDetails = res;
          })
        )
        .subscribe()
    );
  }

  addNewDirector() {
    this.index = this.directorDetails.directorInfo.length;
    this.selectedDirector = {
      directorAddress: '',
      directorCnicPassport: '',
      directorFatherHusbandName: '',
      directorName: '',
      directorNationality: '',
      designation: 'Director',
    };
  }

  deleteDirector(i) {
    this.isRequestSent = true;
    this.directorDetails.directorInfo.splice(i, 1);
    this.response$ = this.dataCleansingService
      .updateDirectorDetails(this.directorDetails)
      .pipe(tap((_) => (this.isRequestSent = false)));
  }

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
