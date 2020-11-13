import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointSubclinicalComponent } from './appoint-subclinical/appoint-subclinical.component';
import { ClinicalExaminationComponent } from './clinical-examination.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';

const routes: Routes = [
  { path: '', component: ClinicalExaminationComponent },
  { path: 'appoint-subclinical', component: AppointSubclinicalComponent },
  { path: 'prescriptions', component: PrescriptionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicalExaminationRoutingModule { }
