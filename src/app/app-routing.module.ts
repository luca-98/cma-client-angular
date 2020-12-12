import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ShellService } from './shell/shell.service';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  {
    path: 'subclinical-report',
    loadChildren: () => import('./subclinical-report/subclinical-report.module').then(m => m.SubclinicalReportModule)
  },
  {
    path: 'medical-examination-report',
    loadChildren: () => import('./medical-exam-report/medical-exam-report.module').then(m => m.MedicalExamReportModule)
  },
  {
    path: 'prescriptions-report',
    loadChildren: () => import('./prescriptions-report/prescriptions-report.module').then(m => m.PrescriptionsReportModule)
  },
  ShellService.childRoutes([
    { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
    {
      path: 'medical-examination',
      loadChildren: () => import('./medical-examination/medical-examination.module').then(m => m.MedicalExaminationModule),
      data: { permissionCode: ['A00'] }
    },
    {
      path: 'manage-medicine',
      loadChildren: () => import('./manage-medicine/manage-medicine.module').then(m => m.ManageMedicineModule),
      data: { permissionCode: ['B00'] }
    },
    {
      path: 'general-manage',
      loadChildren: () => import('./general-manage/general-manage.module').then(m => m.GeneralManageModule),
      data: { permissionCode: ['G00'] }
    },
    {
      path: 'manage-service',
      loadChildren: () => import('./manage-service/manage-service.module').then(m => m.ManageServiceModule),
      data: { permissionCode: ['D00'] }
    },
    {
      path: 'manage-material',
      loadChildren: () => import('./manage-material/manage-material.module').then(m => m.ManageMaterialModule),
      data: { permissionCode: ['C00'] }
    },
    {
      path: 'manage-finance',
      loadChildren: () => import('./manage-finance/manage-finance.module').then(m => m.ManageFinanceModule),
      data: { permissionCode: ['E00'] }
    },
    {
      path: 'report',
      loadChildren: () => import('./report/report.module').then(m => m.ReportModule),
      data: { permissionCode: ['F00'] }
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
