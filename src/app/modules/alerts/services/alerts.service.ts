import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { IOSCO_ALERTS_API } from 'src/app/enums/apis.enum';
import { IResponse } from '../models/response.model';

@Injectable()
export class AlertsService {
  constructor(private http: HttpClient) {}

  uploadSheet(payload: unknown): Observable<IResponse> {
    return this.http.post(
      BASE_URL + IOSCO_ALERTS_API.UPLOAD_IOSCO_ALERTS,
      payload
    ) as Observable<IResponse>;
  }

  getSheet(): Observable<IResponse> {
    return this.http.get(
      BASE_URL + IOSCO_ALERTS_API.GET_IOSCO_ALERTS
    ) as Observable<IResponse>;
  }

  deleteSheet(payload: string): Observable<IResponse> {
    const params = new HttpParams().set('id', payload);
    return this.http.delete(BASE_URL + IOSCO_ALERTS_API.DELETE_IOSCO_ALERT, {
      params,
    }) as Observable<IResponse>;
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(BASE_URL + IOSCO_ALERTS_API.DOWNLOAD_EXCEL_TEMPLATE, {
      responseType: 'blob',
    });
  }

  downloadSheet(payload: string): Observable<Blob> {
    const params = new HttpParams().set('id', payload);
    return this.http.get(BASE_URL + IOSCO_ALERTS_API.DOWNLOAD_IOSCO_ALERT, {
      params,
      responseType: 'blob',
    });
  }
}
