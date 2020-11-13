import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicalExaminationRoutingModule } from './clinical-examination-routing.module';
import { ClinicalExaminationComponent } from './clinical-examination.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AppointSubclinicalComponent } from './appoint-subclinical/appoint-subclinical.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { DATE_PICKER_FORMATS } from 'src/app/core/date-picker-formats';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { AutoDiseaseComponent } from './auto-disease/auto-disease.component';
import { PrescriptionsComponent } from './prescriptions/prescriptions.component';


@NgModule({
  declarations: [ClinicalExaminationComponent, AppointSubclinicalComponent, AutoDiseaseComponent, PrescriptionsComponent],
  imports: [
    CommonModule,
    ClinicalExaminationRoutingModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_PICKER_FORMATS }
  ]
})
export class ClinicalExaminationModule { }
