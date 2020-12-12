import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicalExaminationComponent } from './medical-examination.component';

const routes: Routes = [
  {
    path: 'list-patient',
    loadChildren: () => import('./list-patient/list-patient.module').then(m => m.ListPatientModule),
    data: { permissionCode: ['A10'] }
  },
  {
    path: 'receive-patient',
    loadChildren: () => import('./receive-patient/receive-patient.module').then(m => m.ReceivePatientModule),
    data: { permissionCode: ['A20'] }
  },
  {
    path: 'clinical-examination',
    loadChildren: () => import('./clinical-examination/clinical-examination.module').then(m => m.ClinicalExaminationModule),
    data: { permissionCode: ['A30'] }
  },
  {
    path: 'manage-clinical-examination',
    loadChildren: () => import('./manage-clinical-examination/manage-clinical-examination.module').then(
      m => m.ManageClinicalExaminationModule
    ),
    data: { permissionCode: ['A30'] }
  },
  {
    path: 'subclinical-examination',
    loadChildren: () => import('./subclinical-examination/subclinical-examination.module').then(
      m => m.SubclinicalExaminationModule
    ),
    data: { permissionCode: ['A40'] }
  },
  {
    path: 'manage-subclinical-examination',
    loadChildren: () => import('./manage-subclinical-examination/manage-subclinical-examination.module').then(
      m => m.ManageSubclinicalExaminationModule
    ),
    data: { permissionCode: ['A40'] }
  },
  {
    path: 'manage-appointment',
    loadChildren: () => import('./manage-appointment/manage-appointment.module').then(m => m.ManageAppointmentModule),
    data: { permissionCode: ['A50'] }
  },
  { path: '**', component: MedicalExaminationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalExaminationRoutingModule { }
