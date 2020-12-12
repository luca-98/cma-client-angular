import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointSubclinicalComponent } from './appoint-subclinical/appoint-subclinical.component';
import { ClinicalExaminationComponent } from './clinical-examination.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';

const routes: Routes = [
  { path: '', component: ClinicalExaminationComponent },
  { path: 'appoint-subclinical', component: AppointSubclinicalComponent, data: { permissionCode: ['A33'] } },
  { path: 'prescriptions', component: PrescriptionsComponent, data: { permissionCode: ['A34'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicalExaminationRoutingModule { }
