import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageExportMedicineComponent } from './manage-export-medicine.component';

const routes: Routes = [
  { path: '', component: ManageExportMedicineComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageExportMedicineRoutingModule { }
