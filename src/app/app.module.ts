import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './modules/shared/shared.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { HelpComponent } from './pages/help/help.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { ROUTES } from './routes/routes';

import { HeaderService } from './services/header-service/header.service';
import { UserAccess } from './services/login-service/login.service';
import { AuthGuard } from './services/guards/auth.guard';
import { HeaderInterceptor } from './services/interceptor/http.interceptor';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ForgotPasswordService } from './services/forgot-password-service/forgot-password.service';
import { LogoutService } from './services/logout-service/logout.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LandingPageComponent,
    HelpComponent,
    LogoutComponent,
    HeaderComponent,
    FooterComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(ROUTES),
    SharedModule,
  ],
  providers: [
    UserAccess,
    HeaderService,
    ForgotPasswordService,
    AuthGuard,
    LogoutService,
    { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
    [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
