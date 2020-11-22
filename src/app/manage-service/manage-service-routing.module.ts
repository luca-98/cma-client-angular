import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'service', loadChildren: () => import('./cma-service/cma-service.module').then(m => m.CmaServiceModule) },
  { path: 'group-service', loadChildren: () => import('./cma-group-service/cma-group-service.module').then(m => m.CmaGroupServiceModule) },
  { path: 'template-report', loadChildren: () => import('./template-report/template-report.module').then(m => m.TemplateReportModule) },
  { path: '**', redirectTo: 'service', pathMatch: 'full' }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageServiceRoutingModule { }
