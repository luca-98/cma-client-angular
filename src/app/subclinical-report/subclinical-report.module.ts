import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubclinicalReportRoutingModule } from './subclinical-report-routing.module';
import { SubclinicalReportComponent } from './subclinical-report.component';


@NgModule({
  declarations: [SubclinicalReportComponent],
  imports: [
    CommonModule,
    SubclinicalReportRoutingModule
  ]
})
export class SubclinicalReportModule { }
