import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RevenueReportComponent } from './revenue-report.component';

const routes: Routes = [
  { path: '', component: RevenueReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RevenueReportRoutingModule { }
