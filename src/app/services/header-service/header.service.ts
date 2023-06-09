import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { USER_RIGHTS_API } from 'src/app/enums/apis.enum';

@Injectable()
export class HeaderService {
  constructor(private http: HttpClient) {}

  fetchUserRights(): Observable<any> {
    const params = new HttpParams().set('id', sessionStorage.getItem('cookie'));
    return this.http.get(BASE_URL + USER_RIGHTS_API.FETCH_USER_RIGHTS, {
      params,
    });
  }
}
