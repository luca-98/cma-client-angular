import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'collect-service-fee',
    loadChildren: () => import('./collect-service-fee/collect-service-fee.module').then(m => m.CollectServiceFeeModule)
  },
  { path: '**', redirectTo: 'collect-service-fee', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageFinanceRoutingModule { }
