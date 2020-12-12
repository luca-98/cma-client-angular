import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralManageComponent } from './general-manage.component';

const routes: Routes = [
  {
    path: 'manage-user',
    loadChildren: () => import('./manage-user/manage-user.module').then(m => m.ManageUserModule),
    data: { permissionCode: ['G10'] }
  },
  {
    path: 'manage-user-group',
    loadChildren: () => import('./manage-group-user/manage-group-user.module').then(m => m.ManageGroupUserModule),
    data: { permissionCode: ['G20'] }
  },
  {
    path: 'manage-template-report',
    loadChildren: () => import('./manage-template-print/manage-template-print.module').then(m => m.ManageTemplatePrintModule),
    data: { permissionCode: ['G30'] }
  },
  { path: '**', component: GeneralManageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralManageRoutingModule { }
