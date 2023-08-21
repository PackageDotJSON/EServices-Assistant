import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ROUTES } from './routes/routes.constant';
import { CompanyProfileComponent } from './components/form-list/company-profile/company-profile.component';
import { CapitalStructureComponent } from './components/form-list/capital-structure/capital-structure.component';
import { OfficersInformationComponent } from './components/form-list/officers-information/officers-information.component';
import { DirectorsInformationComponent } from './components/form-list/directors-information/directors-information.component';
import { AuditorInformationComponent } from './components/form-list/auditor-information/auditor-information.component';
import { ShareholdingInformationComponent } from './components/form-list/shareholding-information/shareholding-information.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { MainLayoutComponent } from './pages/main-layout/main-layout.component';
import { CardComponent } from './components/card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from './components/modal/modal.component';
import { DataCleansingService } from './services/data-cleansing.service';
import { CompanyState } from './state-management/company-state.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    MainLayoutComponent,
    CompanyProfileComponent,
    CapitalStructureComponent,
    OfficersInformationComponent,
    DirectorsInformationComponent,
    AuditorInformationComponent,
    ShareholdingInformationComponent,
    StepperComponent,
    MainLayoutComponent,
    CardComponent,
    ModalComponent,
  ],
  providers: [DataCleansingService, CompanyState],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(ROUTES),
  ],
})
export class CleansingModule {}
