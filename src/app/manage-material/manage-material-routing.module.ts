import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageMaterialComponent } from './manage-material.component';
const routes: Routes = [
  {
    path: 'import-material',
    loadChildren: () => import('../manage-medicine/import-medicine/import-medicine.module').then(m => m.ImportMedicineModule),
    data: { permissionCode: ['C10'] }
  },
  { path: '**', component: ManageMaterialComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageMaterialRoutingModule { }
