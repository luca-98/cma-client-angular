import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageMaterialRoutingModule } from './manage-material-routing.module';
import { ManageMaterialComponent } from './manage-material.component';


@NgModule({
  declarations: [ManageMaterialComponent],
  imports: [
    CommonModule,
    ManageMaterialRoutingModule
  ]
})
export class ManageMaterialModule { }
