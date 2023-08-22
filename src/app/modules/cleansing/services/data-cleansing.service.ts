import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DATA_CLEANSING_BASE_URL } from '../constants/cleansing.constant';
import { DATA_CLEANSING_KEY } from 'src/app/constants/base-url.constant';
import { DATA_CLEANSING_API } from 'src/app/enums/apis.enum';
import { ICompanyProfile } from '../models/company-profile.model';
import { IResponse } from '../../alerts/models/response.model';
import { ICapitalStructure } from '../models/capital-structure.model';

@Injectable()
export class DataCleansingService {
  constructor(private http: HttpClient) {}

  getCompanyProfile(cuin: string): Observable<ICompanyProfile> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_COMPANY_PROFILE +
        '/?id=' +
        cuin +
        '&key=' +
        DATA_CLEANSING_KEY
    ) as Observable<ICompanyProfile>;
  }

  updateCompanyProfile(payload: ICompanyProfile): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_COMPANY_PROFILE,
      payload
    ) as Observable<IResponse>;
  }

  getCapitalStructure(cuin: string): Observable<ICapitalStructure> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_CAPITAL_STRUCTURE +
        '/?id=' +
        cuin +
        '&key=' +
        DATA_CLEANSING_KEY
    ) as Observable<ICapitalStructure>;
  }

  updateCapitalStructure(payload: ICapitalStructure): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_CAPITAL_STRUCTURE,
      payload
    ) as Observable<IResponse>;
  }
}
