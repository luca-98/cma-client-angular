import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrescriptionsReportComponent } from './prescriptions-report.component';

const routes: Routes = [
  { path: ':id', component: PrescriptionsReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrescriptionsReportRoutingModule { }
