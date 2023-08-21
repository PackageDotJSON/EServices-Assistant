import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class CompanyState implements OnDestroy {
  private companyState$ = new BehaviorSubject<string>('');

  setCompany(cuin: string) {
    this.companyState$.next(cuin);
  }

  getCompany(): Observable<string> {
    return this.companyState$.asObservable();
  }

  ngOnDestroy(): void {
    this.companyState$.complete();
    this.companyState$.unsubscribe();
  }
}
