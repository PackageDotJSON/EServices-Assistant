import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { Observable, Subscription, of } from 'rxjs';
import { CompanyState } from '../../../state-management/company-state.service';
import { catchError, tap } from 'rxjs/operators';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../../models/director-details.model';
import { IResponse } from 'src/app/modules/alerts/models/response.model';
import { LogoutService } from 'src/app/services/logout-service/logout.service';

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
  lastDirectorError = false;

  constructor(
    private dataCleansingService: DataCleansingService,
    private companyStateService: CompanyState,
    private logoutService: LogoutService
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
          }),
          catchError((err) => {
            if (err.error.message === 'Invalid Token') {
              this.logoutService.logOut();
            }
            return of(null);
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
    if (this.directorDetails.directorInfo.length === 1) {
      this.lastDirectorError = true;
      return;
    } else {
      this.lastDirectorError = false;
    }
    this.isRequestSent = true;
    this.directorDetails.directorInfo.splice(i, 1);
    this.response$ = this.dataCleansingService
      .updateDirectorDetails(this.directorDetails)
      .pipe(
        tap((res) => {
          if (res) {
            if (res.message === 'Invalid Token') {
              this.logoutService.logOut();
              return of(null);
            }
            this.isRequestSent = false;
          }
        }),
        catchError((err) => {
          this.isRequestSent = false;
          return of(err.error);
        })
      );
  }

  getModalState(state: boolean) {
    this.isModalClicked = state;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
