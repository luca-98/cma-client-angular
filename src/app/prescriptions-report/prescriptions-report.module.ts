import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrescriptionsReportRoutingModule } from './prescriptions-report-routing.module';
import { PrescriptionsReportComponent } from './prescriptions-report.component';


@NgModule({
  declarations: [PrescriptionsReportComponent],
  imports: [
    CommonModule,
    PrescriptionsReportRoutingModule
  ]
})
export class PrescriptionsReportModule { }
