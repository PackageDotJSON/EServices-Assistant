import { Component, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  Event,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CLEANSING_ROUTES,
  ROUTES_DESCRIPTION,
} from '../../constants/cleansing.constant';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnDestroy {
  cardHeader: string;
  subscription = new Subscription();

  iterator = 0;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.subscription.add(
      this.router.events
        .pipe(
          tap((event: Event) => {
            event instanceof NavigationEnd &&
              (this.cardHeader = ROUTES_DESCRIPTION[event.url.split('/')[4]]);
          })
        )
        .subscribe()
    );
  }

  navigate() {
    this.iterator += 1;
    this.iterator > 5 && (this.iterator = 0);
    const route = Object.values(CLEANSING_ROUTES);
    this.router.navigate([route[this.iterator]], {
      relativeTo: this.activatedRoute,
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
