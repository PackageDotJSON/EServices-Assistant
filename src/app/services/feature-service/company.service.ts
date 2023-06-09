import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { FEATURE_API } from 'src/app/enums/apis.enum';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http: HttpClient) {}

  fetchCompaniesList(): Observable<any> {
    return this.http.get(BASE_URL + FEATURE_API.FETCH_COMPANIES_LIST);
  }
}
