import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { LogoutComponent } from '../pages/logout/logout.component';
import { HelpComponent } from '../pages/help/help.component';
import { LandingPageComponent } from '../pages/landing-page/landing-page.component';
import { AuthGuard } from '../services/guards/auth.guard';
import { ForgotPasswordComponent } from '../pages/forgot-password/forgot-password.component';

export const ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'forgotpassword',
        component: ForgotPasswordComponent,
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../modules/reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: 'user',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../modules/user/user.module').then((m) => m.UserModule),
      },
      {
        path: 'iosco-alerts',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../modules/alerts/alerts.module').then((m) => m.AlertsModule),
      },
      {
        path: 'home',
        canActivate: [AuthGuard],
        component: LandingPageComponent,
      },
      { path: 'help', canActivate: [AuthGuard], component: HelpComponent },
      { path: 'logout', canActivate: [AuthGuard], component: LogoutComponent },
    ],
  },
];
