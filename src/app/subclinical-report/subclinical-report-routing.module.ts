import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubclinicalReportComponent } from './subclinical-report.component';

const routes: Routes = [
  { path: ':id', component: SubclinicalReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubclinicalReportRoutingModule { }
