import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportMedicineRoutingModule } from './import-medicine-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ImportMedicineComponent } from './import-medicine.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ImportMedicineComponent],
  imports: [
    CommonModule,
    ImportMedicineRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatPaginatorModule
  ]
})
export class ImportMedicineModule { }
