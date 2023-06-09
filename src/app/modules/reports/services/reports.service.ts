import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import {
  BANK_USAGE_REPORT_API,
  COMBINED_CTC_REPORT_API,
  DATA_SHARING_REPORT_API,
} from 'src/app/enums/apis.enum';

@Injectable()
export class ReportsService {
  constructor(private http: HttpClient) {}

  fetchCombinedCtcReport(startDate, endDate): Observable<any> {
    const params = new HttpParams().set('id', startDate).set('id2', endDate);
    return this.http.get(BASE_URL + COMBINED_CTC_REPORT_API.FETCH_CTC_REPORT, {
      params,
    });
  }

  fetchBankUsageReport(payload): Observable<any> {
    return this.http.post(
      BASE_URL + BANK_USAGE_REPORT_API.FETCH_BANK_USAGE_REPORT,
      payload
    );
  }

  fetchDataSharingMonitorReport(): Observable<any> {
    return this.http.get(
      BASE_URL + DATA_SHARING_REPORT_API.FETCH_DATA_SHARING_REPORT
    );
  }

  exportData(data: unknown, apiUrl: string, file: string): Observable<any> {
    return this.http.post(
      BASE_URL + apiUrl,
      {
        value: data,
        fileName: file,
      },
      { responseType: 'text' }
    );
  }

  downloadExcelFile(file: string, apiUrl: string): Observable<any> {
    const params = new HttpParams().set('id', file);
    return this.http.get(BASE_URL + apiUrl, {
      params,
      responseType: 'blob',
    });
  }

  downloadFileToDesktop(data: any, type: string): void {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const pwa = window.open(url);

    if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
      alert('Please disable your pop up blocker for better experience.');
    }
  }
}
