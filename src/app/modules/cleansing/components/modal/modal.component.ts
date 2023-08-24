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
import { COUNTRIES } from '../../settings/cleansing.settings';
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
  readonly countriesList = COUNTRIES;
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
  }

  createInformationForm() {
    this.informationForm = this.formBuilder.group({
      designation: ['', [Validators.required, Validators.maxLength(75)]],
      directorAddress: ['', [Validators.required, Validators.maxLength(512)]],
      directorAppointmentDate: [
        '',
        [Validators.required, Validators.maxLength(75)],
      ],
      directorCnicPassport: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(50),
        ],
      ],
      directorFatherHusbandName: [
        '',
        [Validators.required, Validators.maxLength(100)],
      ],
      directorNTN: ['', [Validators.maxLength(10)]],
      directorName: ['', [Validators.required, Validators.maxLength(100)]],
      directorNationality: [
        '',
        [Validators.required, Validators.maxLength(50)],
      ],
      directorshipNature: ['', [Validators.required, Validators.maxLength(30)]],
      entityNominatingDirector: [
        '',
        [Validators.required, Validators.maxLength(25)],
      ],
      otherOccupation: ['', [Validators.maxLength(512)]],
      status: ['', [Validators.required, Validators.maxLength(25)]],
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
        userId: getUserId(),
      });
    } else {
      this.informationForm.patchValue({
        directorAppointmentDate: convertedDate,
        userId: getUserId(),
      });
    }

    this.remainingData.directorInfo[this.index] = this.informationForm.value;

    if (this.currentRoute === 'directors-information') {
      this.response$ = this.dataCleansingService
        .updateDirectorDetails(this.remainingData)
        .pipe(
          tap((_) => {
            this.isRequestSent = false;
          })
        );
    } else {
      this.response$ = this.dataCleansingService
        .updateAuditorDetails(this.remainingData)
        .pipe(
          tap((_) => {
            this.isRequestSent = false;
          })
        );
    }
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
