import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserAccess } from '../../../services/login-service/login.service';
import { map, tap } from 'rxjs/operators';
import { Admin } from '../../../models/adminpanel.model';
import { Router } from '@angular/router';
import { BASE_URL } from '../../../constants/base-url.constant';
import { USER_PROFILE_API } from '../../../enums/apis.enum';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserprofileComponent implements OnInit, OnDestroy {
  imageUpload: File = null;
  profileData: Admin[] = [];
  name: string;
  email: string;
  userdesignation: string;
  userstatus: string;
  activedirectoryaccount: string;
  employeeid: string;
  location: string;
  password = 'abcdefgh';
  department: string;
  samaccount: string;
  profileImage: any = null;
  pictureRetrieving = true;
  showLogReqError = false;

  userdesignationChanged: string;
  userstatusChanged: string;
  adaccountChanged: string;
  locationChanged: string;
  passwordChanged: string;
  departmentChanged: string;

  enableButton = false;
  shortpassword = false;
  mediumpassword = false;
  longpassword = false;
  passwordStrength = false;
  updateAlert = false;

  noTokenError = false;
  authFailedError = false;
  serverError = false;
  showSuccess = false;

  userMessage: string;

  subscription = new Subscription();

  constructor(
    private http: HttpClient,
    public useraccess: UserAccess,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.fetchImage();
    this.getUserProfile();
    this.mediumpassword = false;
    this.longpassword = false;
    this.shortpassword = false;
    setTimeout(() => {
      this.updateAlert = false;
    }, 3000);
  }

  getUserProfile(): void {
    const params = new HttpParams().set('id', sessionStorage.getItem('cookie'));
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

  initiateRequest(): void {
    this.showLogReqError = false;
    const email = sessionStorage.getItem('cookie');
    if (email) {
      if (this.userMessage.length <= 200 && this.userMessage.length > 10) {
        this.subscription.add(
          this.userService
            .postLogRequest(email, this.userMessage)
            .pipe(
              tap((res) => {
                if (res === 'Data inserted successfully') {
                  this.showSuccess = true;
                } else {
                  this.showSuccess = false;
                }
              })
            )
            .subscribe()
        );
      } else {
        this.showLogReqError = true;
      }
    }
  }

  buttonEnable(): void {
    this.enableButton = true;
  }

  passwordSecurity(): void {
    this.shortpassword = false;
    this.mediumpassword = false;
    this.longpassword = false;
    this.passwordStrength = true;
  }

  checkPassword(): void {
    if (this.password.length < 5) {
      this.passwordStrength = false;
      this.mediumpassword = false;
      this.longpassword = false;
      this.shortpassword = true;
    } else if (this.password.length < 7) {
      this.passwordStrength = false;
      this.shortpassword = false;
      this.longpassword = false;
      this.mediumpassword = true;
    } else if (this.password.length > 7) {
      this.passwordStrength = false;
      this.shortpassword = false;
      this.mediumpassword = false;
      this.longpassword = true;
    }
  }

  updateUserProfile(): void {
    let params;

    if (this.userdesignationChanged !== this.userdesignation) {
      params = new HttpParams()
        .set('id', this.userdesignation)
        .set('id2', sessionStorage.getItem('cookie'))
        .set('id3', 'userdesignation');
    } else if (this.userstatusChanged !== this.userstatus) {
      params = new HttpParams()
        .set('id', this.userstatus)
        .set('id2', sessionStorage.getItem('cookie'))
        .set('id3', 'userstatus');
    } else if (this.adaccountChanged !== this.activedirectoryaccount) {
      params = new HttpParams()
        .set('id', this.activedirectoryaccount)
        .set('id2', sessionStorage.getItem('cookie'))
        .set('id3', 'activedirectoryaccount');
    } else if (this.locationChanged !== this.location) {
      params = new HttpParams()
        .set('id', this.location)
        .set('id2', sessionStorage.getItem('cookie'))
        .set('id3', 'location');
    } else if (this.departmentChanged !== this.department) {
      params = new HttpParams()
        .set('id', this.department)
        .set('id2', sessionStorage.getItem('cookie'))
        .set('id3', 'department');
    } else if (this.passwordChanged !== this.password) {
      if (this.password.length > 7) {
        params = new HttpParams()
          .set('id', this.password)
          .set('id2', sessionStorage.getItem('cookie'))
          .set('id3', 'password');
      } else {
        this.passwordSecurity();
        return;
      }
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

  selectImage(): void {
    document.getElementById('imgUpload').click();
  }

  handleImageInput(files: FileList): void {
    this.imageUpload = files.item(0);
    this.uploadImage();
  }

  uploadImage(): void {
    const formData = new FormData();
    const params = new HttpParams().set('id', sessionStorage.getItem('cookie'));

    formData.append('file', this.imageUpload, this.imageUpload.name);
    this.pictureRetrieving = false;

    this.subscription.add(
      this.http
        .post(BASE_URL + USER_PROFILE_API.UPDATE_IMAGE, formData, {
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
            } else {
              this.fetchImage();
            }
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  fetchImage(): void {
    const params = new HttpParams().set('id', sessionStorage.getItem('cookie'));

    this.subscription.add(
      this.http
        .get(BASE_URL + USER_PROFILE_API.GET_PROFILE_PHOTO, {
          params,
          responseType: 'blob',
        })
        .pipe(
          map((responseData) => {
            return responseData;
          })
        )
        .subscribe(
          (response) => {
            if (this.authFailedError === false && this.noTokenError === false) {
              this.createImageFromBlob(response);
              this.pictureRetrieving = true;
            }
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  createImageFromBlob(image: Blob): void {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        this.profileImage = reader.result;
      },
      false
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
