import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRevenueExpenditureComponent } from './manage-revenue-expenditure.component';

const routes: Routes = [
  { path: '', component: ManageRevenueExpenditureComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRevenueExpenditureRoutingModule { }
