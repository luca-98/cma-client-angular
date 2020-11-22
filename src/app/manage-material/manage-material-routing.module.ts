import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  {
    path: 'import-material',
    loadChildren: () => import('../manage-medicine/import-medicine/import-medicine.module').then(m => m.ImportMedicineModule)
  },
  { path: '**', redirectTo: 'import-material', pathMatch: 'full' }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageMaterialRoutingModule { }
