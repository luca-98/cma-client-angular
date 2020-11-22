import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CollectServiceFeeComponent } from './collect-service-fee.component';

const routes: Routes = [
  { path: '', component: CollectServiceFeeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectServiceFeeRoutingModule { }
