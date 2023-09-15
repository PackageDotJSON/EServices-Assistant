import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { COUNTRIES } from '../../../settings/cleansing.settings';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { CompanyState } from '../../../state-management/company-state.service';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  IAdvisorDetails,
  IAgentDetails,
  ICeoDetails,
  IChiefDetails,
  ISecretaryDetails,
} from '../../../models/officer-details.model';
import {
  convertToTitleCase,
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  getUserId,
} from 'src/app/utility/utility-functions';
import { IResponse } from 'src/app/modules/alerts/models/response.model';
import { optionExistsValidator } from '../../../validators/custom-validator';
import { LogoutService } from 'src/app/services/logout-service/logout.service';

@Component({
  selector: 'app-officers-information',
  templateUrl: './officers-information.component.html',
  styleUrls: ['./officers-information.component.css'],
})
export class OfficersInformationComponent implements OnInit, OnDestroy {
  ceoInfoForm: FormGroup;
  chiefInfoForm: FormGroup;
  advisorInfoForm: FormGroup;
  agentInfoForm: FormGroup;
  secretaryInfoForm: FormGroup;
  readonly countriesList = COUNTRIES;
  subscription = new Subscription();
  cuin: string;
  isRequestSent = false;
  invalidForm = false;
  officerResponse$: Observable<IResponse>;

  constructor(
    private formBuilder: FormBuilder,
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
    this.createForm();
    this.getCeoDetails();
    this.getChiefDetails();
    this.getAdvisorDetails();
    this.getAgentDetails();
    this.getSecretaryDetails();
  }

  createForm() {
    // CEO Details
    this.ceoInfoForm = this.formBuilder.group({
      ceoName: ['', [Validators.required, Validators.maxLength(100)]],
      ceoNIC: [
        '',
        [Validators.pattern('^[a-zA-Z0-9-]*$'), Validators.maxLength(75)],
      ],
      ceoAddress: ['', [Validators.maxLength(512)]],
      ceoCountry: [
        '',
        [Validators.maxLength(50), optionExistsValidator(this.countriesList)],
      ],
      ceoFatherName: ['', [Validators.maxLength(100)]],
      ceoAppDate: ['', [Validators.required, Validators.maxLength(20)]],
      compIncNo: [''],
      userId: [''],
    });

    // Chief Accountant Details
    this.chiefInfoForm = this.formBuilder.group({
      cacName: ['', [Validators.required, Validators.maxLength(100)]],
      cacNIC: [
        '',
        [Validators.pattern('^[a-zA-Z0-9-]*$'), Validators.maxLength(75)],
      ],
      cacAddress: ['', [Validators.maxLength(512)]],
      cacCountry: [
        '',
        [Validators.maxLength(50), optionExistsValidator(this.countriesList)],
      ],
      cacFatherName: ['', [Validators.maxLength(100)]],
      cacAppDate: ['', [Validators.required, Validators.maxLength(20)]],
      compIncNo: [''],
      userId: [''],
    });

    // Legal Advisor Details
    this.advisorInfoForm = this.formBuilder.group({
      lglAdvName: ['', [Validators.required, Validators.maxLength(100)]],
      lglAdvNIC: [
        '',
        [Validators.pattern('^[a-zA-Z0-9-]*$'), Validators.maxLength(75)],
      ],
      lglAdvAddress: ['', [Validators.maxLength(512)]],
      lglAdvCountry: [
        '',
        [Validators.maxLength(50), optionExistsValidator(this.countriesList)],
      ],
      lglAdvFatherName: ['', [Validators.maxLength(100)]],
      lglAdvAppDate: ['', [Validators.required, Validators.maxLength(20)]],
      compIncNo: [''],
      userId: [''],
    });

    // Managing Agent Details
    this.agentInfoForm = this.formBuilder.group({
      mngName: ['', [Validators.maxLength(100)]],
      mngNIC: [
        '',
        [Validators.pattern('^[a-zA-Z0-9-]*$'), Validators.maxLength(75)],
      ],
      mngAddress: ['', [Validators.maxLength(512)]],
      mngCountry: [
        '',
        [Validators.maxLength(50), optionExistsValidator(this.countriesList)],
      ],
      mngFatherName: ['', [Validators.maxLength(100)]],
      mngAppDate: ['', [Validators.maxLength(20)]],
      compIncNo: [''],
      userId: [''],
    });

    // Secretary details
    this.secretaryInfoForm = this.formBuilder.group({
      secrName: ['', [Validators.required, Validators.maxLength(100)]],
      secrNIC: [
        '',
        [Validators.pattern('^[a-zA-Z0-9-]*$'), Validators.maxLength(75)],
      ],
      secrAddress: ['', [Validators.maxLength(512)]],
      secrCountry: [
        '',
        [Validators.maxLength(50), optionExistsValidator(this.countriesList)],
      ],
      secrFatherName: ['', [Validators.maxLength(100)]],
      secrAppDate: ['', [Validators.required, Validators.maxLength(20)]],
      compIncNo: [''],
      userId: [''],
    });
  }

  getCeoDetails() {
    this.subscription.add(
      this.dataCleansingService
        .getCeoDetails(this.cuin)
        .pipe(
          tap((res: ICeoDetails) => {
            if (res.ceoAppDate) {
              const convertedDate: string[] = formatDateToYYYYMMDD([
                res.ceoAppDate,
              ]);

              this.ceoInfoForm.patchValue({
                ...res,
                ceoAppDate: convertedDate,
                compIncNo: this.cuin,
              });
            } else {
              this.ceoInfoForm.patchValue({
                ...res,
                compIncNo: this.cuin,
              });
            }

            this.ceoInfoForm.patchValue({
              ceoCountry:
                this.ceoInfoForm.get('ceoCountry').value === null ||
                this.ceoInfoForm.get('ceoCountry').value === 'null'
                  ? ''
                  : convertToTitleCase(
                      this.ceoInfoForm.get('ceoCountry').value
                    ),
            });
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

  updateCeoDetails() {
    if (this.ceoInfoForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;

    let convertedDate: string[];

    const originalDate = this.ceoInfoForm.get('ceoAppDate').value;

    if (Array.isArray(this.ceoInfoForm.get('ceoAppDate').value)) {
      convertedDate = formatDateToDDMMYYYY([
        this.ceoInfoForm.get('ceoAppDate').value[0],
      ]);
    } else {
      convertedDate = formatDateToDDMMYYYY([
        this.ceoInfoForm.get('ceoAppDate').value,
      ]);
    }

    if (Array.isArray(convertedDate)) {
      this.ceoInfoForm.patchValue({
        ceoAppDate: convertedDate[0],
        userId: getUserId(),
      });
    } else {
      this.ceoInfoForm.patchValue({
        ceoAppDate: convertedDate,
        userId: getUserId(),
      });
    }

    this.officerResponse$ = this.dataCleansingService
      .updateCeoDetails(this.ceoInfoForm.value)
      .pipe(
        tap((res: IResponse) => {
          if (res) {
            if (res) {
              if (res.message === 'Invalid Token') {
                this.logoutService.logOut();
                return of(null);
              }
              this.isRequestSent = false;
              this.ceoInfoForm.patchValue({ ceoAppDate: originalDate });
            }
          }
        }),
        catchError((err) => {
          this.isRequestSent = false;
          return of(err.error);
        })
      );
  }

  getChiefDetails() {
    this.subscription.add(
      this.dataCleansingService
        .getChiefDetails(this.cuin)
        .pipe(
          tap((res: IChiefDetails) => {
            if (res.cacAppDate) {
              const convertedDate: string[] = formatDateToYYYYMMDD([
                res.cacAppDate,
              ]);

              this.chiefInfoForm.patchValue({
                ...res,
                cacAppDate: convertedDate,
                compIncNo: this.cuin,
              });
            } else {
              this.chiefInfoForm.patchValue({
                ...res,
                compIncNo: this.cuin,
              });
            }

            this.chiefInfoForm.patchValue({
              cacCountry:
                this.chiefInfoForm.get('cacCountry').value === null ||
                this.chiefInfoForm.get('cacCountry').value === 'null'
                  ? ''
                  : convertToTitleCase(
                      this.chiefInfoForm.get('cacCountry').value
                    ),
            });
          })
        )
        .subscribe()
    );
  }

  updateChiefDetails() {
    if (this.chiefInfoForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;

    let convertedDate: string[];

    const originalDate = this.chiefInfoForm.get('cacAppDate').value;

    if (Array.isArray(this.chiefInfoForm.get('cacAppDate').value)) {
      convertedDate = formatDateToDDMMYYYY([
        this.chiefInfoForm.get('cacAppDate').value[0],
      ]);
    } else {
      convertedDate = formatDateToDDMMYYYY([
        this.chiefInfoForm.get('cacAppDate').value,
      ]);
    }

    if (Array.isArray(convertedDate)) {
      this.chiefInfoForm.patchValue({
        cacAppDate: convertedDate[0],
        userId: getUserId(),
      });
    } else {
      this.chiefInfoForm.patchValue({
        cacAppDate: convertedDate,
        userId: getUserId(),
      });
    }

    this.officerResponse$ = this.dataCleansingService
      .updateChiefDetails(this.chiefInfoForm.value)
      .pipe(
        tap((res: IResponse) => {
          if (res) {
            if (res) {
              if (res.message === 'Invalid Token') {
                this.logoutService.logOut();
                return of(null);
              }
              this.isRequestSent = false;
              this.chiefInfoForm.patchValue({ cacAppDate: originalDate });
            }
          }
        }),
        catchError((err) => {
          this.isRequestSent = false;
          return of(err.error);
        })
      );
  }

  getAdvisorDetails() {
    this.subscription.add(
      this.dataCleansingService
        .getAdvisorDetails(this.cuin)
        .pipe(
          tap((res: IAdvisorDetails) => {
            if (res.lglAdvAppDate) {
              const convertedDate: string[] = formatDateToYYYYMMDD([
                res.lglAdvAppDate,
              ]);

              this.advisorInfoForm.patchValue({
                ...res,
                lglAdvAppDate: convertedDate,
                compIncNo: this.cuin,
              });
            } else {
              this.advisorInfoForm.patchValue({
                ...res,
                compIncNo: this.cuin,
              });
            }

            this.advisorInfoForm.patchValue({
              lglAdvCountry:
                this.advisorInfoForm.get('lglAdvCountry').value === null ||
                this.advisorInfoForm.get('lglAdvCountry').value === 'null'
                  ? ''
                  : convertToTitleCase(
                      this.advisorInfoForm.get('lglAdvCountry').value
                    ),
            });
          })
        )
        .subscribe()
    );
  }

  updateAdvisorDetails() {
    if (this.advisorInfoForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;

    let convertedDate: string[];

    const originalDate = this.advisorInfoForm.get('lglAdvAppDate').value;

    if (Array.isArray(this.advisorInfoForm.get('lglAdvAppDate').value)) {
      convertedDate = formatDateToDDMMYYYY([
        this.advisorInfoForm.get('lglAdvAppDate').value[0],
      ]);
    } else {
      convertedDate = formatDateToDDMMYYYY([
        this.advisorInfoForm.get('lglAdvAppDate').value,
      ]);
    }

    if (Array.isArray(convertedDate)) {
      this.advisorInfoForm.patchValue({
        lglAdvAppDate: convertedDate[0],
        userId: getUserId(),
      });
    } else {
      this.advisorInfoForm.patchValue({
        lglAdvAppDate: convertedDate,
        userId: getUserId(),
      });
    }

    this.officerResponse$ = this.dataCleansingService
      .updateAdvisorDetails(this.advisorInfoForm.value)
      .pipe(
        tap((res: IResponse) => {
          if (res) {
            if (res.message === 'Invalid Token') {
              this.logoutService.logOut();
              return of(null);
            }
            this.isRequestSent = false;
            this.advisorInfoForm.patchValue({ lglAdvAppDate: originalDate });
          }
        }),
        catchError((err) => {
          this.isRequestSent = false;
          return of(err.error);
        })
      );
  }

  getAgentDetails() {
    this.subscription.add(
      this.dataCleansingService
        .getAgentDetails(this.cuin)
        .pipe(
          tap((res: IAgentDetails) => {
            if (res.mngAppDate) {
              const convertedDate: string[] = formatDateToYYYYMMDD([
                res.mngAppDate,
              ]);

              this.agentInfoForm.patchValue({
                ...res,
                mngAppDate: convertedDate,
                compIncNo: this.cuin,
              });
            } else {
              this.agentInfoForm.patchValue({
                ...res,
                compIncNo: this.cuin,
              });
            }

            this.agentInfoForm.patchValue({
              mngCountry:
                this.agentInfoForm.get('mngCountry').value === null ||
                this.agentInfoForm.get('mngCountry').value === 'null'
                  ? ''
                  : convertToTitleCase(
                      this.agentInfoForm.get('mngCountry').value
                    ),
            });
          })
        )
        .subscribe()
    );
  }

  updateAgentDetails() {
    if (this.agentInfoForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;

    let convertedDate: string[];

    const originalDate = this.agentInfoForm.get('mngAppDate').value;

    if (Array.isArray(this.agentInfoForm.get('mngAppDate').value)) {
      convertedDate = formatDateToDDMMYYYY([
        this.agentInfoForm.get('mngAppDate').value[0],
      ]);
    } else {
      convertedDate = formatDateToDDMMYYYY([
        this.agentInfoForm.get('mngAppDate').value,
      ]);
    }

    if (Array.isArray(convertedDate)) {
      this.agentInfoForm.patchValue({
        mngAppDate: convertedDate[0],
        userId: getUserId(),
      });
    } else {
      this.agentInfoForm.patchValue({
        mngAppDate: convertedDate,
        userId: getUserId(),
      });
    }

    this.officerResponse$ = this.dataCleansingService
      .updateAgentDetails(this.agentInfoForm.value)
      .pipe(
        tap((res: IResponse) => {
          if (res) {
            if (res.message === 'Invalid Token') {
              this.logoutService.logOut();
              return of(null);
            }
            this.isRequestSent = false;
            this.agentInfoForm.patchValue({ mngAppDate: originalDate });
          }
        }),
        catchError((err) => {
          this.isRequestSent = false;
          return of(err.error);
        })
      );
  }

  getSecretaryDetails() {
    this.subscription.add(
      this.dataCleansingService
        .getSecretaryDetails(this.cuin)
        .pipe(
          tap((res: ISecretaryDetails) => {
            if (res.secrAppDate) {
              const convertedDate: string[] = formatDateToYYYYMMDD([
                res.secrAppDate,
              ]);

              this.secretaryInfoForm.patchValue({
                ...res,
                secrAppDate: convertedDate,
                compIncNo: this.cuin,
              });
            } else {
              this.secretaryInfoForm.patchValue({
                ...res,
                compIncNo: this.cuin,
              });
            }

            this.secretaryInfoForm.patchValue({
              secrCountry:
                this.secretaryInfoForm.get('secrCountry').value === null ||
                this.secretaryInfoForm.get('secrCountry').value === 'null'
                  ? ''
                  : convertToTitleCase(
                      this.secretaryInfoForm.get('secrCountry').value
                    ),
            });
          })
        )
        .subscribe()
    );
  }

  updateSecretaryDetails() {
    if (this.secretaryInfoForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;

    let convertedDate: string[];

    const originalDate = this.secretaryInfoForm.get('secrAppDate').value;

    if (Array.isArray(this.secretaryInfoForm.get('secrAppDate').value)) {
      convertedDate = formatDateToDDMMYYYY([
        this.secretaryInfoForm.get('secrAppDate').value[0],
      ]);
    } else {
      convertedDate = formatDateToDDMMYYYY([
        this.secretaryInfoForm.get('secrAppDate').value,
      ]);
    }

    if (Array.isArray(convertedDate)) {
      this.secretaryInfoForm.patchValue({
        secrAppDate: convertedDate[0],
        userId: getUserId(),
      });
    } else {
      this.secretaryInfoForm.patchValue({
        secrAppDate: convertedDate,
        userId: getUserId(),
      });
    }

    this.officerResponse$ = this.dataCleansingService
      .updateSecretaryDetails(this.secretaryInfoForm.value)
      .pipe(
        tap((res: IResponse) => {
          if (res) {
            if (res.message === 'Invalid Token') {
              this.logoutService.logOut();
              return of(null);
            }
            this.isRequestSent = false;
            this.secretaryInfoForm.patchValue({ secrAppDate: originalDate });
          }
        }),
        catchError((err) => {
          this.isRequestSent = false;
          return of(err.error);
        })
      );
  }

  deleteOfficer(option: string) {
    this.isRequestSent = true;
    const userId = this.ceoInfoForm.get('userId').value;
    const compIncNo = this.ceoInfoForm.get('compIncNo').value;

    if (option === 'CEO') {
      this.ceoInfoForm.reset();
      this.ceoInfoForm.patchValue({
        userId,
        compIncNo,
      });
      this.officerResponse$ = this.dataCleansingService
        .updateCeoDetails(this.ceoInfoForm.value)
        .pipe(
          tap((res: IResponse) => {
            if (res) {
              if (res) {
                if (res.message === 'Invalid Token') {
                  this.logoutService.logOut();
                  return of(null);
                }
                this.isRequestSent = false;
              }
            }
          }),
          catchError((err) => {
            this.isRequestSent = false;
            return of(err.error);
          })
        );
    } else if (option === 'Chief Information') {
      this.chiefInfoForm.reset();
      this.chiefInfoForm.patchValue({
        userId,
        compIncNo,
      });

      this.officerResponse$ = this.dataCleansingService
        .updateChiefDetails(this.chiefInfoForm.value)
        .pipe(
          tap((res: IResponse) => {
            if (res) {
              if (res) {
                if (res.message === 'Invalid Token') {
                  this.logoutService.logOut();
                  return of(null);
                }
                this.isRequestSent = false;
              }
            }
          }),
          catchError((err) => {
            this.isRequestSent = false;
            return of(err.error);
          })
        );
    } else if (option === 'Legal Advisor') {
      this.advisorInfoForm.reset();
      this.advisorInfoForm.patchValue({
        userId,
        compIncNo,
      });

      this.officerResponse$ = this.dataCleansingService
        .updateAdvisorDetails(this.advisorInfoForm.value)
        .pipe(
          tap((res: IResponse) => {
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
    } else if (option === 'Management Agent') {
      this.agentInfoForm.reset();
      this.agentInfoForm.patchValue({
        userId,
        compIncNo,
      });

      this.officerResponse$ = this.dataCleansingService
        .updateAgentDetails(this.agentInfoForm.value)
        .pipe(
          tap((res: IResponse) => {
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
    } else if (option === 'Secretary') {
      this.secretaryInfoForm.reset();
      this.secretaryInfoForm.patchValue({
        userId,
        compIncNo,
      });

      this.officerResponse$ = this.dataCleansingService
        .updateSecretaryDetails(this.secretaryInfoForm.value)
        .pipe(
          tap((res: IResponse) => {
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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
