import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../../models/director-details.model';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { CompanyState } from '../../../state-management/company-state.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-auditor-information',
  templateUrl: './auditor-information.component.html',
  styleUrls: ['./auditor-information.component.css'],
})
export class AuditorInformationComponent implements OnInit {
  isModalClicked = false;
  subscription = new Subscription();
  cuin: string;
  auditorDetails: IDirectorDetails;
  selectedAuditor: ISingleDirector;
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
        .getAuditorDetails(this.cuin)
        .pipe(
          tap((res: IDirectorDetails) => {
            this.auditorDetails = res;
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
