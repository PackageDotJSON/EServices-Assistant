import { Routes } from '@angular/router';
import { CompanyProfileComponent } from '../components/form-list/company-profile/company-profile.component';
import { MainLayoutComponent } from '../pages/main-layout/main-layout.component';
import { CapitalStructureComponent } from '../components/form-list/capital-structure/capital-structure.component';
import { OfficersInformationComponent } from '../components/form-list/officers-information/officers-information.component';
import { DirectorsInformationComponent } from '../components/form-list/directors-information/directors-information.component';
import { AuditorInformationComponent } from '../components/form-list/auditor-information/auditor-information.component';
import { ShareholdingInformationComponent } from '../components/form-list/shareholding-information/shareholding-information.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'company-profile',
        component: CompanyProfileComponent,
      },
      {
        path: 'capital-structure',
        component: CapitalStructureComponent,
      },
      {
        path: 'officers-information',
        component: OfficersInformationComponent,
      },
      {
        path: 'directors-information',
        component: DirectorsInformationComponent,
      },
      {
        path: 'auditor-information',
        component: AuditorInformationComponent,
      },
      {
        path: 'shareholding-information',
        component: ShareholdingInformationComponent,
      },
    ],
  },
];
