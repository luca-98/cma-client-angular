import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectDebtComponent } from './collect-debt.component';

const routes: Routes = [
  { path: '', component: CollectDebtComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectDebtRoutingModule { }
