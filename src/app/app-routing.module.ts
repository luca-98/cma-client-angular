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
