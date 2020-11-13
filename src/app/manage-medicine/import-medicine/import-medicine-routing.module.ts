import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImportMedicineComponent } from './import-medicine.component';

const routes: Routes = [
  { path: '', component: ImportMedicineComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportMedicineRoutingModule { }
