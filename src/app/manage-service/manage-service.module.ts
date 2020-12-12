import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageServiceRoutingModule } from './manage-service-routing.module';
import { ManageServiceComponent } from './manage-service.component';

@NgModule({
  declarations: [ManageServiceComponent],
  imports: [
    CommonModule,
    ManageServiceRoutingModule
  ]
})
export class ManageServiceModule { }
