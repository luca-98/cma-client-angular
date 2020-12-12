import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageMedicineComponent } from './manage-medicine.component';

const routes: Routes = [
  {
    path: 'import-medicine',
    loadChildren: () => import('./import-medicine/import-medicine.module').then(m => m.ImportMedicineModule),
    data: { permissionCode: ['B10'] }
  },
  {
    path: 'export-medicine',
    loadChildren: () => import('./export-medicine/export-medicine.module').then(m => m.ExportMedicineModule),
    data: { permissionCode: ['B20'] }
  },
  {
    path: 'manage-export-medicine',
    loadChildren: () => import('./manage-export-medicine/manage-export-medicine.module').then(m => m.ManageExportMedicineModule),
    data: { permissionCode: ['B30'] }
  },
  { path: '**', component: ManageMedicineComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageMedicineRoutingModule { }
