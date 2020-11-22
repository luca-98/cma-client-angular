import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast/toast.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NotifyDialogComponent } from './dialogs/notify-dialog/notify-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PatientAutocompleteComponent } from './patient-autocomplete/patient-autocomplete.component';
import { LoadingComponent } from './loading/loading.component';
import { EditPatientDialogComponent } from './dialogs/edit-patient-dialog/edit-patient-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DATE_PICKER_FORMATS } from '../core/date-picker-formats';
import { AddAppoinmentComponent } from './dialogs/add-appoinment/add-appoinment.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { SupplierAutocompleteComponent } from './supplier-autocomplete/supplier-autocomplete.component';
import { EditAppointmentComponent } from './dialogs/edit-appointment/edit-appointment.component';
import { AddServiceComponent } from './dialogs/add-service/add-service.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddGroupServiceComponent } from './dialogs/add-group-service/add-group-service.component';


@NgModule({
  declarations: [
    ToastComponent, NotifyDialogComponent,
    ConfirmDialogComponent, PatientAutocompleteComponent,
    LoadingComponent, EditPatientDialogComponent,
    AddAppoinmentComponent, SupplierAutocompleteComponent, EditAppointmentComponent, AddServiceComponent, AddGroupServiceComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    MatCheckboxModule,


  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: DATE_PICKER_FORMATS }
  ],
  exports: [PatientAutocompleteComponent, LoadingComponent, SupplierAutocompleteComponent, EditAppointmentComponent, AddServiceComponent,
    AddGroupServiceComponent]
})
export class SharedModule { }
