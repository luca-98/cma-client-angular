import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExportMedicineComponent } from './export-medicine.component';

const routes: Routes = [
  { path: '', component: ExportMedicineComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExportMedicineRoutingModule { }
