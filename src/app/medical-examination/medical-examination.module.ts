import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalExaminationRoutingModule } from './medical-examination-routing.module';
import { MedicalExaminationComponent } from './medical-examination.component';


@NgModule({
  declarations: [MedicalExaminationComponent],
  imports: [
    CommonModule,
    MedicalExaminationRoutingModule
  ]
})
export class MedicalExaminationModule { }
