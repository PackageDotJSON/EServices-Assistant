import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CLEANSING_ROUTES } from '../../constants/cleansing.constant';
import { tap } from 'rxjs/operators';
import { CompanyState } from '../../state-management/company-state.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
})
export class StepperComponent implements OnDestroy {
  readonly routeUrls = CLEANSING_ROUTES;
  private subscription = new Subscription();
  companyName: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private companyStateService: CompanyState
  ) {
    this.subscription.add(
      this.activatedRoute.paramMap
        .pipe(
          tap((params) => {
            this.companyStateService.setCompany(params.get('id'));
          })
        )
        .subscribe()
    );

    this.companyName =
      this.router.getCurrentNavigation().extras.state.companyName;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
