import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedicalExamReportComponent } from './medical-exam-report.component';

const routes: Routes = [
  { path: ':id', component: MedicalExamReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalExamReportRoutingModule { }
