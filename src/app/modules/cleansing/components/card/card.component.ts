import { Component, OnDestroy } from '@angular/core';
import { Event, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ROUTES_DESCRIPTION } from '../../constants/cleansing.constant';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnDestroy {
  cardHeader: string;
  subscription = new Subscription();

  constructor(private router: Router) {
    this.subscription.add(
      this.router.events
        .pipe(
          tap((event: Event) => {
            event instanceof NavigationStart &&
              (this.cardHeader = ROUTES_DESCRIPTION[event.url.split('/')[4]]);
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
