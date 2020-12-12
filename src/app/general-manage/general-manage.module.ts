import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralManageRoutingModule } from './general-manage-routing.module';
import { GeneralManageComponent } from './general-manage.component';

@NgModule({
  declarations: [GeneralManageComponent],
  imports: [
    CommonModule,
    GeneralManageRoutingModule
  ]
})
export class GeneralManageModule { }
