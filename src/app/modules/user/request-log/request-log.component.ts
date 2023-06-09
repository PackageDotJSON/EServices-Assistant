import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RequestLog } from 'src/app/modules/user/models/requestlog.model';
import { UserService } from '../services/user.service';
import { Admin } from '../../../models/adminpanel.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { USER_PROFILE_API } from 'src/app/enums/apis.enum';
import { UserAccess } from 'src/app/services/login-service/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-log',
  templateUrl: './request-log.component.html',
  styleUrls: ['./request-log.component.css'],
})
export class RequestlogComponent implements OnInit, OnDestroy {
  requestsLog$: Observable<RequestLog>;
  isSuccess = false;
  noTokenError = false;
  authFailedError = false;
  serverError = false;
  enableButton = false;
  updateAlert = false;
  profileData: Admin[] = [];
  name: string;
  email: string;
  userdesignation: string;
  userstatus: string;
  activedirectoryaccount: string;
  employeeid: string;
  location: string;
  department: string;
  samaccount: string;
  password = 'Password';
  userdesignationChanged: string;
  userstatusChanged: string;
  adaccountChanged: string;
  locationChanged: string;
  passwordChanged: string;
  departmentChanged: string;
  emailToChange: string;

  subscription = new Subscription();

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private useraccess: UserAccess,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getLogRequests();
  }

  getLogRequests(): void {
    this.requestsLog$ = this.userService.getLogRequests();
  }

  deleteReqLog(log: any): void {
    this.subscription.add(
      this.userService
        .deleteLogRequest(log.USEREMAIL, log.USERMESSAGE)
        .pipe(
          tap((res) => {
            if (res.status === 'ok') {
              this.isSuccess = true;
              this.getLogRequests();
            }
          })
        )
        .subscribe()
    );
  }

  getUserProfile(log: any): void {
    this.emailToChange = log.USEREMAIL;
    const params = new HttpParams().set('id', log.USEREMAIL);
    this.subscription.add(
      this.http
        .get<{ [key: string]: Admin }>(
          BASE_URL + USER_PROFILE_API.GET_USER_PROFILE,
          { params }
        )
        .pipe(
          map((responseData) => {
            if (JSON.stringify(responseData).includes('No Token Provided')) {
              this.noTokenError = true;
            } else if (
              JSON.stringify(responseData).includes(
                'Authorization Failed. Token Expired. Please Login Again.'
              )
            ) {
              this.authFailedError = true;
              setTimeout(() => {
                this.useraccess.accessTypeFull = false;
                this.useraccess.accessTypePartial = false;
                this.useraccess.accessTypeMinimum = false;
                window.sessionStorage.clear();
                this.router.navigateByUrl('/');
                location.reload();
              }, 2000);
            } else {
              const postsArray: Admin[] = [];
              for (const key in responseData) {
                if (responseData.hasOwnProperty(key)) {
                  postsArray.push({ ...responseData[key], idadmin: key });
                }
              }
              return postsArray;
            }
          })
        )
        .subscribe(
          (response) => {
            if (this.authFailedError === false && this.noTokenError === false) {
              this.profileData = response;
              this.name = this.profileData[0].name;
              this.email = this.profileData[0].email;
              this.userdesignation = this.profileData[0].userdesignation;
              this.userstatus = this.profileData[0].userstatus;
              this.activedirectoryaccount =
                this.profileData[0].activedirectoryaccount;
              this.employeeid = this.profileData[0].employeeid;
              this.location = this.profileData[0].location;
              this.department = this.profileData[0].department;
              this.samaccount = this.profileData[0].samaccount;
              this.userdesignationChanged = this.userdesignation;
              this.userstatusChanged = this.userstatus;
              this.adaccountChanged = this.activedirectoryaccount;
              this.locationChanged = this.location;
              this.passwordChanged = this.password;
              this.departmentChanged = this.department;
            }
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  updateUserProfile(): void {
    let params;

    if (this.userdesignationChanged !== this.userdesignation) {
      params = new HttpParams()
        .set('id', this.userdesignation)
        .set('id2', this.emailToChange)
        .set('id3', 'userdesignation');
    } else if (this.userstatusChanged !== this.userstatus) {
      params = new HttpParams()
        .set('id', this.userstatus)
        .set('id2', this.emailToChange)
        .set('id3', 'userstatus');
    } else if (this.adaccountChanged !== this.activedirectoryaccount) {
      params = new HttpParams()
        .set('id', this.activedirectoryaccount)
        .set('id2', this.emailToChange)
        .set('id3', 'activedirectoryaccount');
    } else if (this.locationChanged !== this.location) {
      params = new HttpParams()
        .set('id', this.location)
        .set('id2', this.emailToChange)
        .set('id3', 'location');
    } else if (this.departmentChanged !== this.department) {
      params = new HttpParams()
        .set('id', this.department)
        .set('id2', this.emailToChange)
        .set('id3', 'department');
    }

    this.subscription.add(
      this.http
        .put(BASE_URL + USER_PROFILE_API.UPDATE_USER_PROFILE, null, {
          params,
          responseType: 'text',
        })
        .subscribe(
          (responseData) => {
            if (responseData === 'No Token Provided') {
              this.noTokenError = true;
            } else if (
              responseData ===
              'Authorization Failed. Token Expired. Please Login Again.'
            ) {
              this.authFailedError = true;
              setTimeout(() => {
                this.useraccess.accessTypeFull = false;
                this.useraccess.accessTypePartial = false;
                this.useraccess.accessTypeMinimum = false;
                window.sessionStorage.clear();
                this.router.navigateByUrl('/');
                location.reload();
              }, 2000);
            } else if (responseData === 'Data updated successfully') {
              this.updateAlert = true;
              this.ngOnInit();
            }
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  buttonEnable(): void {
    this.enableButton = true;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
