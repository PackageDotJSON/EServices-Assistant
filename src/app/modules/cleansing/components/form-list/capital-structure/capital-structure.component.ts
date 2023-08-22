import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataCleansingService } from '../../../services/data-cleansing.service';
import { CompanyState } from '../../../state-management/company-state.service';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ICapitalStructure } from '../../../models/capital-structure.model';
import { IResponse } from 'src/app/modules/alerts/models/response.model';

@Component({
  selector: 'app-capital-structure',
  templateUrl: './capital-structure.component.html',
  styleUrls: ['./capital-structure.component.css'],
})
export class CapitalStructureComponent implements OnInit, OnDestroy {
  capitalStructureForm: FormGroup;
  subscription = new Subscription();
  cuin: string;
  capitalResponse$: Observable<IResponse>;
  isRequestSent = false;
  invalidForm = false;

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
    this.getCapitalStructure();
  }

  createForm() {
    this.capitalStructureForm = this.formBuilder.group({
      compPerShareValue: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(22),
        ],
      ],
      compAthrzCap: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(22),
        ],
      ],
      compAthrzCapShrs: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(22),
        ],
      ],
      compAthrzPerValue: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(22),
        ],
      ],
      compPadupCap: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(22),
        ],
      ],
      compPadupCapShrs: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(22),
        ],
      ],
      compIncNo: [this.cuin],
      userId: [],
    });
  }

  getCapitalStructure() {
    this.subscription.add(
      this.dataCleansingService
        .getCapitalStructure(this.cuin)
        .pipe(
          tap((res: ICapitalStructure) => {
            this.capitalStructureForm.patchValue({
              ...res,
            });
          })
        )
        .subscribe()
    );
  }

  updateCapitalStructure() {
    if (this.capitalStructureForm.invalid === true) {
      this.invalidForm = true;
      return;
    } else {
      this.invalidForm = false;
    }

    this.isRequestSent = true;
    this.capitalStructureForm.patchValue({
      userId: sessionStorage.getItem('cookie').split('@')[0],
    });

    this.capitalResponse$ = this.dataCleansingService
      .updateCapitalStructure(this.capitalStructureForm.value)
      .pipe(
        tap((res: IResponse) => {
          res && ((this.isRequestSent = false), this.getCapitalStructure());
        })
      );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
