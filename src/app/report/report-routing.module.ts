import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportComponent } from './report.component';

const routes: Routes = [
  { path: '', component: ReportComponent },
  {
    path: 'revenue-report',
    loadChildren: () => import('./revenue-report/revenue-report.module').then(m => m.RevenueReportModule),
    data: { permissionCode: ['F10'] }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
