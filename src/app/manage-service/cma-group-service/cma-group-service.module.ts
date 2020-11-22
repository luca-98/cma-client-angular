import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CmaGroupServiceRoutingModule } from './cma-group-service-routing.module';
import { CmaGroupServiceComponent } from './cma-group-service.component';
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


@NgModule({
  declarations: [CmaGroupServiceComponent],
  imports: [
    CommonModule,
    CmaGroupServiceRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    SharedModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
  ]
})
export class CmaGroupServiceModule { }
