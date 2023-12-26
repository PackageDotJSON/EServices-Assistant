import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { VENDORS_API } from 'src/app/enums/apis.enum';
import { Observable } from 'rxjs';
import { IResponse } from '../../alerts/models/response.model';

@Injectable()
export class NadraAndPmdBillingReportService {
  constructor(private http: HttpClient) {}

  getNadraReport(
    startDate?: string,
    endDate?: string,
    userCnic?: string
  ): Observable<IResponse> {
    let params;
    if (userCnic) {
      params = new HttpParams().set('userCnic', userCnic);
    } else {
      params = new HttpParams()
        .set('startDate', startDate)
        .set('endDate', endDate);
    }
    return this.http.get(BASE_URL + VENDORS_API.GET_NADRA_REPORT, {
      params,
    }) as Observable<IResponse>;
  }

  getPmdReport(
    startDate?: string,
    endDate?: string,
    userCnic?: string
  ): Observable<IResponse> {
    let params;
    if (userCnic) {
      params = new HttpParams().set('userCnic', userCnic);
    } else {
      params = new HttpParams()
        .set('startDate', startDate)
        .set('endDate', endDate);
    }
    return this.http.get(BASE_URL + VENDORS_API.GET_PMD_REPORT, {
      params,
    }) as Observable<IResponse>;
  }
}
