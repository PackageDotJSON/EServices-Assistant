import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DATA_CLEANSING_BASE_URL,
  QUERY_STRING_GENERATOR,
} from '../constants/cleansing.constant';
import { DATA_CLEANSING_KEY } from 'src/app/constants/base-url.constant';
import { DATA_CLEANSING_API } from 'src/app/enums/apis.enum';
import { ICompanyProfile } from '../models/company-profile.model';
import { IResponse } from '../../alerts/models/response.model';
import { ICapitalStructure } from '../models/capital-structure.model';
import { getUserId } from 'src/app/utility/utility-functions';
import {
  IAdvisorDetails,
  IAgentDetails,
  ICeoDetails,
  IChiefDetails,
  ISecretaryDetails,
} from '../models/officer-details.model';
import { IDirectorDetails } from '../models/director-details.model';

@Injectable()
export class DataCleansingService {
  userId: string;

  constructor(private http: HttpClient) {
    this.userId = getUserId();
  }

  getCompanyProfile(cuin: string): Observable<ICompanyProfile> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_COMPANY_PROFILE +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
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
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<ICapitalStructure>;
  }

  updateCapitalStructure(payload: ICapitalStructure): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_CAPITAL_STRUCTURE,
      payload
    ) as Observable<IResponse>;
  }

  getCeoDetails(cuin: string): Observable<ICeoDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_CEO_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<ICeoDetails>;
  }

  updateCeoDetails(payload: ICeoDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_CEO_DETAILS,
      payload
    ) as Observable<IResponse>;
  }

  getChiefDetails(cuin: string): Observable<IChiefDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_CHIEF_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<IChiefDetails>;
  }

  updateChiefDetails(payload: IChiefDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_CHIEF_DETAILS,
      payload
    ) as Observable<IResponse>;
  }

  getAdvisorDetails(cuin: string): Observable<IAdvisorDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_ADVISOR_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<IAdvisorDetails>;
  }

  updateAdvisorDetails(payload: IAdvisorDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_ADVISOR_DETAILS,
      payload
    ) as Observable<IResponse>;
  }

  getAgentDetails(cuin: string): Observable<IAgentDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_AGENT_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<IAgentDetails>;
  }

  updateAgentDetails(payload: IAgentDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_AGENT_DETAILS,
      payload
    ) as Observable<IResponse>;
  }

  getSecretaryDetails(cuin: string): Observable<ISecretaryDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_SECRETARY_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<ISecretaryDetails>;
  }

  updateSecretaryDetails(payload: ISecretaryDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_SECRETARY_DETAILS,
      payload
    ) as Observable<IResponse>;
  }

  getDirectorDetails(cuin: string): Observable<IDirectorDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_DIRECTOR_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<IDirectorDetails>;
  }

  updateDirectorDetails(payload: IDirectorDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_DIRECTOR_DETAILS,
      payload
    ) as Observable<IResponse>;
  }

  getAuditorDetails(cuin: string): Observable<IDirectorDetails> {
    return this.http.get(
      DATA_CLEANSING_BASE_URL +
        DATA_CLEANSING_API.GET_AUDITOR_DETAILS +
        QUERY_STRING_GENERATOR.ONE +
        cuin +
        QUERY_STRING_GENERATOR.TWO +
        DATA_CLEANSING_KEY +
        QUERY_STRING_GENERATOR.THREE +
        this.userId
    ) as Observable<IDirectorDetails>;
  }

  updateAuditorDetails(payload: IDirectorDetails): Observable<IResponse> {
    payload.key = DATA_CLEANSING_KEY;
    return this.http.post(
      DATA_CLEANSING_BASE_URL + DATA_CLEANSING_API.UPDATE_AUDITOR_DETAILS,
      payload
    ) as Observable<IResponse>;
  }
}
