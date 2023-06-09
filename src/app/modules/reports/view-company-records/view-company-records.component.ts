import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { UserAccess } from '../../../services/login-service/login.service';
import { Router } from '@angular/router';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BASE_URL } from '../../../constants/base-url.constant';
import { FEATURE_API, PRODUCTS_API } from '../../../enums/apis.enum';
import { EXTERNAL_URLS } from '../../../constants/external-urls.constant';
import { DEBOUNCE_TIME } from 'src/app/settings/app.settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-company-records',
  templateUrl: './view-company-records.component.html',
  styleUrls: ['./view-company-records.component.css'],
})
export class ViewCompanyRecordsComponent implements OnDestroy {
  checkCompany = true;
  checkIncorporation = false;
  checkArchive = false;
  checkEServices = true;
  serverError = false;
  emptyFormError = false;
  dataAvailable = false;
  containsData = false;
  containsNoData = false;
  noTokenError = false;
  authFailedError = false;
  spinnerLoading: boolean;
  companyName: string;
  incorporationNumber: string;
  archiveDocumentType = 'Select Document Type';
  documentStatus = 'Select Document Status';
  sortBy = 'Sort by';
  processName = 'Select Process Name';
  startDate = 'start date';
  endDate = 'end date';
  fetchedData: any[] = [];
  cardCheckArray: any[] = [];
  internalDocs: any[] = [];
  internalDocsFileStatus = false;
  spinnerLoading2 = false;
  InternalDocDataFetch = false;
  notingDataFetch = false;
  fileResponse: string;
  fileResponseName: string;
  fileResponseLink: string;
  notingResponse: any[] = [];
  notingResponseToDisplay: any[] = [];
  notingResponseStatus = false;
  enabledByDefault = true;
  dataUnAvailable = false;
  companiesName = [''];
  readonly archiveDocumentUrl = EXTERNAL_URLS.ARCHIVE_DOCUMENT;
  isTyping = false;
  hasError = false;

  subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private router: Router,
    private useraccess: UserAccess
  ) {}

  processListByCompany(): void {
    const params = new HttpParams().set('id', this.companyName);
    this.companiesName = [];
    this.subscription.add(
      this.http
        .get<{ [key: string]: any }>(
          BASE_URL + PRODUCTS_API.PROCESS_LIST_BY_COMPANY_NAME,
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
              return responseData.rows;
            }
          }),
          debounceTime(DEBOUNCE_TIME),
          distinctUntilChanged()
        )
        .subscribe(
          (posts) => {
            if (this.authFailedError === false && this.noTokenError === false) {
              posts.forEach((item, index) =>
                this.companiesName.push(posts[index][1])
              );
            }
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  goBack(): void {
    this.dataAvailable = false;
    this.spinnerLoading = false;
  }

  fetchData(): void {
    this.hasError = false;
    this.emptyFormError = false;
    this.containsNoData = false;
    this.containsData = false;
    this.dataAvailable = false;
    this.fetchedData = [];
    this.cardCheckArray = [];

    if (this.checkCompany === true && this.checkEServices === true) {
      if (this.companyName === undefined || this.companyName === null) {
        this.emptyFormError = true;
        return;
      }

      this.spinnerLoading = true;

      const params = new HttpParams()
        .set('id', this.companyName)
        .set('id2', this.documentStatus)
        .set('id3', this.sortBy)
        .set('id4', this.processName)
        .set('id5', this.startDate)
        .set('id6', this.endDate);

      this.subscription.add(
        this.http
          .get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NAME_IN_ESERVICES, {
            params,
          })
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
                return responseData;
              }
            })
          )
          .subscribe(
            (response) => {
              Object.keys(response).length === 0
                ? ((this.containsNoData = true), (this.spinnerLoading = false))
                : (this.containsData = true);
              this.dataAvailable = true;
              this.fetchedData.push(response);
              this.fetchedData = this.fetchedData[0];
              this.companyName = null;

              this.fetchedData.length === 0
                ? (this.dataUnAvailable = true)
                : (this.dataUnAvailable = false);

              let swap = this.fetchedData[0].PROCESS_NAME;
              for (const x in this.fetchedData) {
                if (swap === this.fetchedData[x].PROCESS_NAME) {
                  continue;
                } else {
                  this.cardCheckArray.push(swap);
                  swap = this.fetchedData[x].PROCESS_NAME;
                }
              }
              this.cardCheckArray.push(swap);

              for (const i of this.fetchedData.keys()) {
                this.fetchedData[i].DOCUMENT_NAME =
                  this.fetchedData[i].DOCUMENT_NAME.split(' ').join('%20');
                this.fetchedData[i].DOCUMENT_NAME =
                  EXTERNAL_URLS.DOCUMENT_URL +
                  this.fetchedData[i].DOCUMENT_NAME;
              }

              this.spinnerLoading = false;
            },
            (error) => {
              this.serverError = true;
            }
          )
      );
    } else if (
      this.checkIncorporation === true &&
      this.checkEServices === true
    ) {
      if (
        this.incorporationNumber === undefined ||
        this.incorporationNumber === null
      ) {
        this.emptyFormError = true;
        return;
      }

      this.spinnerLoading = true;
      const params = new HttpParams()
        .set('id', this.incorporationNumber)
        .set('id2', this.documentStatus)
        .set('id3', this.sortBy)
        .set('id4', this.processName)
        .set('id5', this.startDate)
        .set('id6', this.endDate);

      this.subscription.add(
        this.http
          .get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NUMBER_IN_ESERVICES, {
            params,
          })
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
                return responseData;
              }
            })
          )
          .subscribe(
            (response) => {
              Object.keys(response).length === 0
                ? ((this.containsNoData = true), (this.spinnerLoading = false))
                : (this.containsData = true);

              this.dataAvailable = true;
              this.fetchedData.push(response);
              this.fetchedData = this.fetchedData[0];
              this.incorporationNumber = null;

              this.fetchedData.length === 0
                ? (this.dataUnAvailable = true)
                : (this.dataUnAvailable = false);

              let swap = this.fetchedData[0].PROCESS_NAME;

              for (const x in this.fetchedData) {
                if (swap === this.fetchedData[x].PROCESS_NAME) {
                  continue;
                } else {
                  this.cardCheckArray.push(swap);
                  swap = this.fetchedData[x].PROCESS_NAME;
                }
              }
              this.cardCheckArray.push(swap);

              this.spinnerLoading = false;
            },
            (error) => {
              this.serverError = true;
            }
          )
      );
    } else if (this.checkCompany === true && this.checkArchive === true) {
      if (this.companyName === undefined || this.companyName === null) {
        this.emptyFormError = true;
        return;
      }
      if(this.archiveDocumentType === 'Select Document Type') {
        this.hasError = true;
        return;
      }

      this.spinnerLoading = true;
      const params = new HttpParams()
        .set('id', this.companyName)
        .set('id2', this.archiveDocumentType);
      this.subscription.add(
        this.http
          .get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NAME_IN_ARCHIVE, { params })
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
                return responseData;
              }
            })
          )
          .subscribe(
            (response) => {
              Object.keys(response).length === 0
                ? ((this.containsNoData = true), (this.spinnerLoading = false))
                : (this.containsData = true);

              this.dataAvailable = true;
              this.fetchedData.push(response);
              this.fetchedData = this.fetchedData[0];
              this.companyName = null;

              this.fetchedData.length === 0
                ? (this.dataUnAvailable = true)
                : (this.dataUnAvailable = false);

              this.spinnerLoading = false;
            },
            (error) => {
              this.serverError = true;
            }
          )
      );
    } else if (this.checkIncorporation === true && this.checkArchive === true) {
      if (
        this.incorporationNumber === undefined ||
        this.incorporationNumber === null
      ) {
        this.emptyFormError = true;
        return;
      }
      if(this.archiveDocumentType === 'Select Document Type') {
        this.hasError = true;
        return;
      }

      this.spinnerLoading = true;
      const params = new HttpParams()
        .set('id', this.incorporationNumber)
        .set('id2', this.archiveDocumentType);
      this.subscription.add(
        this.http
          .get(BASE_URL + FEATURE_API.FETCH_DATA_BY_NUMBER_IN_ARCHIVE, {
            params,
          })
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
                return responseData;
              }
            })
          )
          .subscribe(
            (response) => {
              Object.keys(response).length === 0
                ? ((this.containsNoData = true), (this.spinnerLoading = false))
                : (this.containsData = true);

              this.dataAvailable = true;
              this.fetchedData.push(response);
              this.fetchedData = this.fetchedData[0];
              this.incorporationNumber = null;

              this.fetchedData.length === 0
                ? (this.dataUnAvailable = true)
                : (this.dataUnAvailable = false);

              this.spinnerLoading = false;
            },
            (error) => {
              this.serverError = true;
            }
          )
      );
    }
  }

  viewInternalDocs(arrayValue: string): void {
    this.internalDocs = [];
    this.internalDocsFileStatus = false;
    this.InternalDocDataFetch = false;
    this.spinnerLoading2 = false;
    this.spinnerLoading2 = true;
    const arraycheck = arrayValue.match(/\d/g);
    const userProcessID = arraycheck.join('');
    let compFldrID;

    for (const x in this.fetchedData) {
      if (this.fetchedData[x].USER_PROCESS_ID === userProcessID) {
        compFldrID = this.fetchedData[x].COMP_PID;
      }
    }
    const bodytoSend = { compFldrID, userProcessID };
    this.subscription.add(
      this.http
        .post(EXTERNAL_URLS.INTERNAL_DOCUMENT_URL, bodytoSend, {
          headers: {
            caller: sessionStorage.getItem('cookie'),
            'ip-address': '0.0.0.0',
            'Content-Type': 'application/json',
          },
        })
        .subscribe(
          (response) => {
            this.internalDocs.push(response);
            this.InternalDocDataFetch = true;
            if (this.internalDocs[0].response.length <= 0) {
              this.spinnerLoading2 = false;
              this.internalDocsFileStatus = true;
            } else {
              this.spinnerLoading2 = false;
              this.internalDocsFileStatus = false;
              this.fileResponse = this.internalDocs[0].response;

              const newstringDoc = this.fileResponse
                .split('=')
                .pop()
                .split('>')[0];
              const newstringDocName = this.fileResponse
                .split('=')
                .pop()
                .split('>')[1];

              const newstringDocLink =
                EXTERNAL_URLS.SERVLET_DOCUMENT + newstringDoc;
              const newstringDocNameLink = newstringDocName.split('<')[0];

              this.fileResponseLink = newstringDocLink;
              this.fileResponseName = newstringDocNameLink;
            }
          },
          (error) => {
            this.serverError = true;
          }
        )
    );
  }

  viewNoting(data: string): void {
    this.notingResponse = [];
    this.notingResponseToDisplay = [];
    this.notingDataFetch = false;
    this.spinnerLoading2 = false;
    this.notingResponseStatus = false;
    this.spinnerLoading2 = true;
    const arraycheck = data.match(/\d/g);
    const userProcessID = arraycheck.join('');
    let pfid;

    for (const x in this.fetchedData) {
      if (this.fetchedData[x].USER_PROCESS_ID === userProcessID) {
        pfid = this.fetchedData[x].PROCESS_FLDR_ID;
      }
    }

    this.subscription.add(
      this.http
        .get(EXTERNAL_URLS.NOTING_SHEET + pfid, {
          headers: {
            caller: sessionStorage.getItem('cookie'),
            'ip-address': '0.0.0.0',
          },
        })
        .subscribe((response) => {
          this.notingResponse.push(response);
          this.notingDataFetch = true;

          if (this.notingResponse[0].response.length <= 0) {
            this.spinnerLoading2 = false;
            this.notingResponseStatus = true;
          } else {
            this.spinnerLoading2 = false;
            this.notingResponseStatus = false;
            const newNoting = this.notingResponse[0].response
              .split('<<')
              .join('')
              .split('>>');

            for (const x in newNoting) {
              if (newNoting[x].length >= 5) {
                this.notingResponseToDisplay.push(newNoting[x]);
              }
            }
          }
        })
    );
  }

  closeCompanyDropDown() {
    this.companiesName = [''];
    this.isTyping = false;
  }

  changeDocsStatus(): void {
    this.internalDocsFileStatus = false;
    this.InternalDocDataFetch = false;
    this.notingResponseStatus = false;
    this.notingDataFetch = false;
  }

  companySelect(): void {
    this.checkCompany = true;
    this.checkIncorporation = false;
    this.enabledByDefault = true;
  }

  incorporationSelect(): void {
    this.checkIncorporation = true;
    this.checkCompany = false;
    this.enabledByDefault = false;
  }

  eServicesSelect(): void {
    this.checkEServices = true;
    this.checkArchive = false;
  }

  archiveSelect(): void {
    this.checkArchive = true;
    this.checkEServices = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
