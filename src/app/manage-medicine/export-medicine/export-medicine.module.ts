import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExportMedicineRoutingModule } from './export-medicine-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ExportMedicineComponent } from './export-medicine.component';


@NgModule({
  declarations: [ExportMedicineComponent],
  imports: [
    CommonModule,
    ExportMedicineRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatPaginatorModule
  ]
})
export class ExportMedicineModule { }
