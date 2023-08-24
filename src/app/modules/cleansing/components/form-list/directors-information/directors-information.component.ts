import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { Subscription } from 'rxjs';
import { CompanyState } from '../../../state-management/company-state.service';
import { tap } from 'rxjs/operators';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../../models/director-details.model';

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

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
