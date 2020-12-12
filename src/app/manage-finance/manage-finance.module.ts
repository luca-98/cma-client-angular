import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageFinanceRoutingModule } from './manage-finance-routing.module';
import { ManageFinanceComponent } from './manage-finance.component';


@NgModule({
  declarations: [ManageFinanceComponent],
  imports: [
    CommonModule,
    ManageFinanceRoutingModule
  ]
})
export class ManageFinanceModule { }
