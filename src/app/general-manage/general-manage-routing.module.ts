import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'manage-template-report',
    loadChildren: () => import('./manage-template-print/manage-template-print.module').then(m => m.ManageTemplatePrintModule)
  },
  { path: '**', redirectTo: 'manage-template-report', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralManageRoutingModule { }
