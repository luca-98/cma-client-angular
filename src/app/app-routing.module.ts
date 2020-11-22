import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ShellService } from './shell/shell.service';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  ShellService.childRoutes([
    { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
    {
      path: 'medical-examination',
      loadChildren: () => import('./medical-examination/medical-examination.module').then(m => m.MedicalExaminationModule)
    },
    {
      path: 'manage-medicine',
      loadChildren: () => import('./manage-medicine/manage-medicine.module').then(m => m.ManageMedicineModule)
    },
    {
      path: 'general-manage',
      loadChildren: () => import('./general-manage/general-manage.module').then(m => m.GeneralManageModule)
    },
    {
      path: 'manage-service',
      loadChildren: () => import('./manage-service/manage-service.module').then(m => m.ManageServiceModule)
    },
    {
      path: 'manage-material',
      loadChildren: () => import('./manage-material/manage-material.module').then(m => m.ManageMaterialModule)
    }
    ,
    {
      path: 'manage-finance',
      loadChildren: () => import('./manage-finance/manage-finance.module').then(m => m.ManageFinanceModule)
    }
  ]),

  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
