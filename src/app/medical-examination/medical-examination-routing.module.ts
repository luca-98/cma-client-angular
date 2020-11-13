import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'list-patient', loadChildren: () => import('./list-patient/list-patient.module').then(m => m.ListPatientModule) },
  { path: 'receive-patient', loadChildren: () => import('./receive-patient/receive-patient.module').then(m => m.ReceivePatientModule) },
  {
    path: 'clinical-examination',
    loadChildren: () => import('./clinical-examination/clinical-examination.module').then(m => m.ClinicalExaminationModule)
  },
  {
    path: 'manage-clinical-examination',
    loadChildren: () => import('./manage-clinical-examination/manage-clinical-examination.module').then(
      m => m.ManageClinicalExaminationModule
    )
  },
  {
    path: 'subclinical-examination',
    loadChildren: () => import('./subclinical-examination/subclinical-examination.module').then(
      m => m.SubclinicalExaminationModule
    )
  },
  {
    path: 'manage-subclinical-examination',
    loadChildren: () => import('./manage-subclinical-examination/manage-subclinical-examination.module').then(
      m => m.ManageSubclinicalExaminationModule
    )
  },
  {
    path: 'appointment',
    loadChildren: () => import('./appointment/appointment.module').then(m => m.AppointmentModule)
  },
  {
    path: 'manage-appointment',
    loadChildren: () => import('./manage-appointment/manage-appointment.module').then(m => m.ManageAppointmentModule)
  },
  { path: '**', redirectTo: 'receive-patient', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalExaminationRoutingModule { }
