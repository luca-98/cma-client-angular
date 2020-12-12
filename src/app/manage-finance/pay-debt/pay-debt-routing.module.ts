import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayDebtComponent } from './pay-debt.component';

const routes: Routes = [
  { path: '', component: PayDebtComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayDebtRoutingModule { }
