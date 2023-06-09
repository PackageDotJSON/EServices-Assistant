import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from 'src/app/constants/base-url.constant';
import { LOGIN_API } from 'src/app/enums/apis.enum';

@Injectable()
export class ForgotPasswordService {
  constructor(private http: HttpClient) {}

  forgotPassword(payload): Observable<any> {
    if (!sessionStorage.token) {
      sessionStorage.setItem('token', 'abc');
    }
    return this.http.post(BASE_URL + LOGIN_API.FORGOT_PASSWORD_API, payload, {
      responseType: 'text',
    });
  }

  verifyCode(payload): Observable<any> {
    return this.http.post(BASE_URL + LOGIN_API.VERIFY_CODE_API, payload, {
      responseType: 'text',
    });
  }

  createNewPassword(payload): Observable<any> {
    if (!sessionStorage.token) {
      sessionStorage.setItem('token', 'abc');
    }
    const params = new HttpParams()
      .set('id', payload.password)
      .set('id2', payload.email)
      .set('id3', payload.name);
    return this.http.put(BASE_URL + LOGIN_API.CREATE_NEW_PASSWORD_API, null, {
      params,
      responseType: 'text',
    });
  }
}
