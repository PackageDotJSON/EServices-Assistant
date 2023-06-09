import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class UserAccess implements OnDestroy {
  isHeaderFooterVisible$ = new BehaviorSubject<boolean>(false);
  accessTypeFull = false;
  accessTypePartial = false;
  accessTypeMinimum = false;

  fullUserAccess(): void {
    this.accessTypeFull = true;
    sessionStorage.setItem('accessTypeFull', 'true');
  }

  partialUserAccess(): void {
    this.accessTypePartial = true;
    sessionStorage.setItem('accessTypePartial', 'true');
  }

  minimumUserAccess(): void {
    this.accessTypeMinimum = true;
    sessionStorage.setItem('accessTypeMinimum', 'true');
  }

  displayHeaderFooter(value: boolean): void {
    this.isHeaderFooterVisible$.next(value);
  }

  getHeaderFooter(): Observable<boolean> {
    return this.isHeaderFooterVisible$;
  }

  ngOnDestroy(): void {
    this.isHeaderFooterVisible$?.unsubscribe();
  }
}
