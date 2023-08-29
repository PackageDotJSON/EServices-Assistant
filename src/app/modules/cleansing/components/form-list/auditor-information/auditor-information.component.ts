import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../../models/director-details.model';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { CompanyState } from '../../../state-management/company-state.service';
import { tap } from 'rxjs/operators';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

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
    this.getAuditorData();
  }

  getAuditorData() {
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

  addNewAuditor() {
    this.index = this.auditorDetails.directorInfo.length;
    this.selectedAuditor = {
      directorAddress: '',
      directorCnicPassport: '',
      directorFatherHusbandName: '',
      directorName: '',
      directorNationality: 'Pakistan',
      designation: 'Auditor',
    };
  }

  deleteAuditor(i) {
    this.isRequestSent = true;
    this.auditorDetails.directorInfo.splice(i, 1);
    this.response$ = this.dataCleansingService
      .updateAuditorDetails(this.auditorDetails)
      .pipe(tap((_) => (this.isRequestSent = false)));
  }

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
