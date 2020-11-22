import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'import-medicine', loadChildren: () => import('./import-medicine/import-medicine.module').then(m => m.ImportMedicineModule) },
  { path: 'export-medicine', loadChildren: () => import('./export-medicine/export-medicine.module').then(m => m.ExportMedicineModule) },
  {
    path: 'manage-export-medicine',
    loadChildren: () => import('./manage-export-medicine/manage-export-medicine.module').then(m => m.ManageExportMedicineModule)
  },
  { path: '**', redirectTo: 'import-medicine', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageMedicineRoutingModule { }
