import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CITIES,
  COMPANY_TYPES,
  DISTRICTS,
  INDUSTRY_TYPES,
} from '../../../settings/cleansing.settings';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CompanyState } from '../../../state-management/company-state.service';
import { ICompanyProfile } from '../../../models/company-profile.model';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css'],
})
export class CompanyProfileComponent implements OnInit, OnDestroy {
  companyProfileForm: FormGroup;
  cuin: string;
  readonly cityList = CITIES;
  readonly districtList = DISTRICTS;
  readonly industryList = INDUSTRY_TYPES;
  readonly companyList = COMPANY_TYPES;
  companyResponse$: Observable<IResponse>;
  isRequestSent = false;
  subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
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
    this.createForm();
    this.getCompanyProfile();
  }

  createForm() {
    this.companyProfileForm = this.formBuilder.group({
      compName: ['', [Validators.required, Validators.maxLength(100)]],
      compIncNo: ['', [Validators.required, Validators.maxLength(40)]],
      incDate: ['', [Validators.required, Validators.maxLength(20)]],
      compSector: ['', [Validators.required, Validators.maxLength(100)]],
      compKind: ['', [Validators.required, Validators.maxLength(150)]],
      compDistt: ['', [Validators.required, Validators.maxLength(75)]],
      compCro: ['', [Validators.required, Validators.maxLength(50)]],
      compAddress: ['', [Validators.required, Validators.maxLength(512)]],
      compEmail: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(124)],
      ],
      compFaxNo: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(20),
        ],
      ],
      compPhoneNo: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(50),
        ],
      ],
      compPhoneNo2: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(50),
        ],
      ],
      compStatus: ['', [Validators.required, Validators.maxLength(40)]],
      holdingCompCode: ['', [Validators.required, Validators.maxLength(100)]],
      compMainObj: ['', [Validators.required, Validators.maxLength(3074)]],
      agmDt: ['', [Validators.required, Validators.maxLength(20)]],
      frmADate: ['', [Validators.required, Validators.maxLength(20)]],
      oldCmpnyNm: ['', [Validators.required, Validators.maxLength(100)]],
      compCity: ['', [Validators.required, Validators.maxLength(75)]],
      compProvince: ['', [Validators.required, Validators.maxLength(75)]],
      listed: ['', [Validators.required, Validators.maxLength(1)]],
      compSubMode: ['', [Validators.required, Validators.maxLength(25)]],
      stateOwned: ['', [Validators.required, Validators.maxLength(1)]],
      compCaseFlag: ['', [Validators.required, Validators.maxLength(80)]],
    });
  }

  getCompanyProfile() {
    this.subscription.add(
      this.dataCleansingService
        .getCompanyProfile(this.cuin)
        .pipe(
          tap((res: ICompanyProfile) => {
            this.companyProfileForm.patchValue({
              ...res,
            });
          })
        )
        .subscribe()
    );
  }

  updateCompanyProfile() {
    this.isRequestSent = true;
    this.companyResponse$ = this.dataCleansingService
      .updateCompanyProfile(this.companyProfileForm.value)
      .pipe(
        tap((res: IResponse) => {
          res && ((this.isRequestSent = false), this.getCompanyProfile());
        })
      );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
