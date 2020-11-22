import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CmaServiceRoutingModule } from './cma-service-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CmaServiceComponent } from './cma-service.component';


@NgModule({
  declarations: [CmaServiceComponent],
  imports: [
    CommonModule,
    CmaServiceRoutingModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    SharedModule,
    FormsModule,
    MatAutocompleteModule,
    MatDialogModule,
    ReactiveFormsModule,
  ]
})
export class CmaServiceModule { }
