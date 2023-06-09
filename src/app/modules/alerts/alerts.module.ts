import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ROUTES } from './routes/routes.constant';
import { SharedModule } from '../shared/shared.module';

import { UploadSheetCardComponent } from './components/upload-sheet-card/upload-sheet-card.component';
import { UploadAlertsComponent } from './pages/upload-alerts/upload-alerts.component';
import { ViewAlertsComponent } from './pages/view-alerts/view-alerts.component';
import { AlertLinksComponent } from './components/alert-links/alert-links.component';
import { AlertsComponent } from './alerts.component';
import { ViewSheetTableComponent } from './components/view-sheet-table/view-sheet-table.component';

import { NativeElementInjectorDirective } from './directives/native-element-injector.directive';

import { AlertsService } from './services/alerts.service';
import { DownloadFileService } from './services/download-file.service';

@NgModule({
  declarations: [
    AlertsComponent,
    UploadSheetCardComponent,
    UploadAlertsComponent,
    ViewAlertsComponent,
    AlertLinksComponent,
    ViewSheetTableComponent,
    NativeElementInjectorDirective,
  ],
  providers: [AlertsService, DownloadFileService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(ROUTES),
    SharedModule,
  ],
})
export class AlertsModule {}
