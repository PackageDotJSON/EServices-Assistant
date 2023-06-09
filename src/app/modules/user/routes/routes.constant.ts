import { Routes } from '@angular/router';
import { ApplicationManagementComponent } from '../role-management/application-management/application-management.component';
import { EservicesManagementComponent } from '../role-management/eservices-management/eservices-management.component';
import { RequestlogComponent } from '../request-log/request-log.component';
import { UserprofileComponent } from '../user-profile/user-profile.component';

export const ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'applicationmanagement',
        component: ApplicationManagementComponent,
      },
      { path: 'eservicesmanagement', component: EservicesManagementComponent },
      { path: 'profile', component: UserprofileComponent },
      { path: 'requestlog', component: RequestlogComponent },
    ],
  },
];
