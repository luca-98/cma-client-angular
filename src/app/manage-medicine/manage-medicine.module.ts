import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageMedicineRoutingModule } from './manage-medicine-routing.module';
import { ManageMedicineComponent } from './manage-medicine.component';


@NgModule({
  declarations: [ManageMedicineComponent],
  imports: [
    CommonModule,
    ManageMedicineRoutingModule
  ]
})
export class ManageMedicineModule { }
