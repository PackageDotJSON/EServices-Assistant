import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { SELECT_DROPDOWN_SETTINGS } from 'src/app/settings/app.settings';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-eservices-management',
  templateUrl: './eservices-management.component.html',
  styleUrls: ['./eservices-management.component.css'],
})
export class EservicesManagementComponent implements OnInit, OnDestroy {
  eservicesData$: Observable<any>;
  eservicesRole$: Observable<any>;
  searchDataKey: string;
  eServicesForm: FormGroup;
  isResponseRetrieved = false;
  isSuccess = false;
  isError = false;
  formEvent = 'Submit';
  readonly dropdownSettings = SELECT_DROPDOWN_SETTINGS;
  isReadOnly = false;

  subscription = new Subscription();

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.eServicesForm = this.formBuilder.group({
      firstName: null,
      lastName: null,
      userId: null,
      userStatus: null,
      userCell: null,
      userEmail: null,
      isUserMigrated: null,
      createdBy: null,
      createdWhen: null,
      modifiedBy: null,
      modifiedWhen: null,
      userGender: null,
      userCro: null,
      businessCategory: null,
      employeeType: null,
      adUser: null,
      userPassword: null,
      employeeId: null,
      userDesignation: null,
      userDepartment: null,
      userLocation: null,
      userRoles: null,
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.fetchRoles();
  }

  fetchData(): void {
    this.eservicesData$ = this.userService.fetchEServicesData();
  }

  fetchRoles(): void {
    this.eservicesRole$ = this.userService.fetchRolesLookUp();
  }

  searchData(): void {
    this.eservicesData$ = this.userService.searchEServicesData(
      this.searchDataKey
    );
  }

  submitData(): void {
    this.isResponseRetrieved = this.isError = false;

    const d = new Date();
    const date =
      new Date().toISOString().split('T')[0] +
      ' ' +
      d.toTimeString().split(' ')[0];

    const userName = sessionStorage.getItem('user');

    if (this.formEvent === 'Submit') {
      this.eServicesForm.patchValue({
        createdBy: userName,
        createdWhen: date,
        modifiedBy: userName,
        modifiedWhen: date,
      });

      if (Object.values(this.eServicesForm.value).includes(null)) {
        this.isError = true;
        return;
      }

      this.subscription.add(
        this.userService
          .postEServicesData(this.eServicesForm.value)
          .pipe(
            switchMap(() =>
              this.userService
                .postEServicesRoles(
                  this.eServicesForm.value.userRoles,
                  this.eServicesForm.value.userId
                )
                .pipe(
                  tap((res) => {
                    this.isResponseRetrieved = true;
                    res === 'Success'
                      ? ((this.isSuccess = true), this.eServicesForm.reset())
                      : (this.isSuccess = false);
                  })
                )
            )
          )
          .subscribe()
      );
    } else {
      if (
        this.eServicesForm.get('createdBy').value === null &&
        this.eServicesForm.get('createdWhen').value === null
      ) {
        this.eServicesForm.patchValue({
          createdBy: userName,
          createdWhen: date,
        });
      }

      this.eServicesForm.patchValue({
        modifiedBy: userName,
        modifiedWhen: date,
      });

      if (Object.values(this.eServicesForm.value).includes(null)) {
        this.isError = true;
        return;
      }

      this.subscription.add(
        this.userService
          .updateEServicesData(this.eServicesForm.value)
          .pipe(
            switchMap(() =>
              this.userService
                .updateEServicesRoles(
                  this.eServicesForm.value.userRoles,
                  this.eServicesForm.value.userId
                )
                .pipe(
                  tap((res) => {
                    this.isResponseRetrieved = true;
                    res === 'Success'
                      ? ((this.isSuccess = true), this.eServicesForm.reset())
                      : (this.isSuccess = false);
                  })
                )
            )
          )
          .subscribe()
      );
    }
  }

  getSingleUserData(searchKey: string): void {
    this.subscription.add(
      this.userService
        .fetchSingleUserEServicesData(searchKey)
        .pipe(
          tap((res) => {
            this.eServicesForm.patchValue({
              firstName: res[0].F_NAME,
              lastName: res[0].L_NAME,
              userId: res[0].USER_ID,
              userStatus: res[0].USER_STATUS,
              userCell: res[0].USER_CELL,
              userEmail: res[0].USER_EMAIL,
              isUserMigrated: res[0].IS_MIGRATED_USER,
              createdBy: res[0].CREATED_BY,
              createdWhen: res[0].CREATED_WHEN,
              modifiedBy: res[0].MODIFIED_BY,
              modifiedWhen: res[0].MODIFIED_WHEN,
              userGender: res[0].GENDER,
              userCro: res[0].CRO,
              businessCategory: res[0].BUSINESS_CATEGORY,
              employeeType: res[0].EMPLOYEE_TYPE,
              adUser: res[0].AD_USER,
              userPassword: res[0].PASSWORD,
              employeeId: res[0].EMPLOYEE_ID,
              userDesignation: res[0].DESIGNATION,
              userDepartment: res[0].DEPARTMENT,
              userLocation: res[0].LOCATION,
            });
          })
        )
        .subscribe()
    );
    this.isReadOnly = true;
  }

  getSingleRole(item: string): void {
    this.subscription.add(
      this.userService
        .fetchSingleRoleLookup(item)
        .pipe(
          tap((res) => {
            this.eServicesForm.patchValue({
              userRoles: res,
            });
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
