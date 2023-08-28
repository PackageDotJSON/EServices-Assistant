import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Output,
  Input,
  ViewChild,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CompanyState } from '../../state-management/company-state.service';
import {
  IDirectorDetails,
  ISingleDirector,
} from '../../models/director-details.model';
import { CITIES, COUNTRIES } from '../../settings/cleansing.settings';
import { DataCleansingService } from '../../services/data-cleansing.service';
import { IResponse } from 'src/app/modules/alerts/models/response.model';
import {
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  getUserId,
} from 'src/app/utility/utility-functions';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modalButton') modalButton: ElementRef<HTMLInputElement>;
  @Output() closeModalEvent = new EventEmitter<boolean>();
  @Input() formData: ISingleDirector;
  @Input() remainingData: IDirectorDetails;
  @Input() index: number;
  informationForm: FormGroup;
  currentRoute: string;
  subscription = new Subscription();
  cuin: string;
  readonly countryList = COUNTRIES;
  readonly cityList = CITIES;
  response$: Observable<IResponse>;
  isRequestSent = false;
  invalidForm = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private companyStateService: CompanyState,
    private dataCleansingService: DataCleansingService
  ) {
    this.currentRoute = this.router.url.split('/')[4];

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
    this.createInformationForm();
    this.insertFormData();
    this.setValidators();
  }

  setValidators() {
    this.subscription.add(
      this.informationForm.valueChanges
        .pipe(
          tap((_) => {
            if (
              this.currentRoute === 'auditor-information' ||
              this.currentRoute === 'director-information'
            ) {
              // add required validators for both auditor and director
              this.informationForm
                .get('designation')
                .setValidators(Validators.required);
              this.informationForm
                .get('directorAppointmentDate')
                .setValidators([
                  Validators.required,
                  Validators.pattern(/^\d{4}-\d{2}-\d{2}$/),
                ]);
              this.informationForm
                .get('status')
                .setValidators(Validators.required);
              this.informationForm
                .get('directorFatherHusbandName')
                .setValidators(Validators.required);

              // remove not required validators for both auditor and director
              this.informationForm
                .get('directorNumberOfShares')
                .clearValidators();
              this.informationForm.get('directorCity').clearValidators();
              this.informationForm
                .get('directorValueOfShares')
                .clearValidators();
              this.informationForm
                .get('directorClassOfShares')
                .clearValidators();

              this.informationForm.updateValueAndValidity();
            }

            if (this.currentRoute === 'director-information') {
              // add additional validators required for director only
              this.informationForm
                .get('directorNTN')
                .setValidators(Validators.required);

              this.informationForm.updateValueAndValidity();
            }

            if (this.currentRoute === 'shareholding-information') {
              // add validators required for shareholder
              this.informationForm
                .get('directorNumberOfShares')
                .setValidators(Validators.required);

              // remove not required validator for shareholder that are required for both director and auditor
              this.informationForm
                .get('directorAppointmentDate')
                .clearValidators();
              this.informationForm.get('designation').clearValidators();
              this.informationForm.get('directorNTN').clearValidators();
              this.informationForm.get('otherOccupation').clearValidators();
              this.informationForm.get('status').clearValidators();
              this.informationForm
                .get('directorFatherHusbandName')
                .clearValidators();
              this.informationForm
                .get('directorFatherHusbandName')
                .setValidators(Validators.maxLength(100));

              this.informationForm.updateValueAndValidity();
            }
          })
        )
        .subscribe()
    );
  }

  createInformationForm() {
    this.informationForm = this.formBuilder.group({
      // required parameter in all the three forms
      directorAddress: ['', [Validators.required, Validators.maxLength(512)]],
      directorCnicPassport: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]*$'),
          Validators.maxLength(50),
        ],
      ],
      directorFatherHusbandName: ['', [Validators.maxLength(100)]],
      directorName: ['', [Validators.required, Validators.maxLength(100)]],
      directorNationality: [
        '',
        [Validators.required, Validators.maxLength(50)],
      ],

      // optional parameters
      directorNumberOfShares: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
      designation: ['', [Validators.maxLength(75)]],
      directorAppointmentDate: ['', [Validators.maxLength(75)]],
      directorNTN: [
        null,
        [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
      directorshipNature: ['', [Validators.maxLength(30)]],
      entityNominatingDirector: ['', [Validators.maxLength(25)]],
      otherOccupation: ['', [Validators.maxLength(512)]],
      status: ['', [Validators.maxLength(25)]],
      directorCity: ['', [Validators.maxLength(75)]],
      directorValueOfShares: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
      directorClassOfShares: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
    });
  }

  insertFormData() {
    const convertedDate: string[] = formatDateToYYYYMMDD([
      this.formData.directorAppointmentDate,
    ]);

    this.informationForm.patchValue({
      ...this.formData,
      directorAppointmentDate: convertedDate,
    });
  }

  updateInfo() {
    if (this.informationForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;
    let convertedDate: string[];

    let originalDate;

    if (
      this.currentRoute === 'directors-information' ||
      this.currentRoute === 'auditor-information'
    ) {
      originalDate = this.informationForm.get('directorAppointmentDate').value;

      if (
        Array.isArray(this.informationForm.get('directorAppointmentDate').value)
      ) {
        convertedDate = formatDateToDDMMYYYY([
          this.informationForm.get('directorAppointmentDate').value[0],
        ]);
      } else {
        convertedDate = formatDateToDDMMYYYY([
          this.informationForm.get('directorAppointmentDate').value,
        ]);
      }

      if (Array.isArray(convertedDate)) {
        this.informationForm.patchValue({
          directorAppointmentDate: convertedDate[0],
        });
      } else {
        this.informationForm.patchValue({
          directorAppointmentDate: convertedDate,
        });
      }
    }

    this.remainingData.userId = getUserId();

    if (this.currentRoute === 'directors-information') {
      this.removeControls(
        'directorNumberOfShares',
        'directorCity',
        'directorValueOfShares',
        'directorClassOfShares'
      );

      this.remainingData.directorInfo[this.index] = this.informationForm.value;

      this.removeNullKeys(
        this.remainingData.directorInfo,
        this.informationForm.value
      );

      this.response$ = this.dataCleansingService
        .updateDirectorDetails(this.remainingData)
        .pipe(
          tap((_) => {
            this.isRequestSent = false;
            this.informationForm.patchValue({
              directorAppointmentDate: originalDate,
            });
          })
        );
    } else if (this.currentRoute === 'auditor-information') {
      this.removeControls(
        'directorNumberOfShares',
        'directorshipNature',
        'entityNominatingDirector',
        'directorCity',
        'directorValueOfShares',
        'directorClassOfShares'
      );

      this.remainingData.directorInfo[this.index] = this.informationForm.value;

      this.removeNullKeys(
        this.remainingData.directorInfo,
        this.informationForm.value
      );

      this.response$ = this.dataCleansingService
        .updateAuditorDetails(this.remainingData)
        .pipe(
          tap((_) => {
            this.isRequestSent = false;
            this.informationForm.patchValue({
              directorAppointmentDate: originalDate,
            });
          })
        );
    } else {
      this.removeControls(
        'designation',
        'directorAppointmentDate',
        'directorNTN',
        'otherOccupation',
        'status',
        'directorshipNature',
        'entityNominatingDirector'
      );

      this.remainingData.directorInfo[this.index] = this.informationForm.value;

      this.removeNullKeys(
        this.remainingData.directorInfo,
        this.informationForm.value
      );

      this.response$ = this.dataCleansingService
        .updateShareholderDetails(this.remainingData)
        .pipe(
          tap((_) => {
            this.isRequestSent = false;
          })
        );
    }
  }

  removeControls(...controlNames) {
    controlNames.forEach((control) => {
      this.informationForm.removeControl(control);
    });
  }

  removeNullKeys(array, comparisonObject) {
    array.forEach((obj) => {
      for (const key in obj) {
        if (!comparisonObject.hasOwnProperty(key)) {
          delete obj[key];
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.modalButton.nativeElement.click();
  }

  closeModal() {
    this.closeModalEvent.emit(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
