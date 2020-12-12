import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageFinanceComponent } from './manage-finance.component';

const routes: Routes = [
  { path: '', component: ManageFinanceComponent },
  {
    path: 'collect-service-fee',
    loadChildren: () => import('./collect-service-fee/collect-service-fee.module').then(m => m.CollectServiceFeeModule),
    data: { permissionCode: ['E10'] }
  },
  {
    path: 'collect-debt',
    loadChildren: () => import('./collect-debt/collect-debt.module').then(m => m.CollectDebtModule),
    data: { permissionCode: ['E40'] }
  },
  {
    path: 'manage-revenue-expenditure',
    loadChildren: () => import('./manage-revenue-expenditure/manage-revenue-expenditure.module')
      .then(m => m.ManageRevenueExpenditureModule),
    data: { permissionCode: ['E50'] }
  },
  {
    path: 'pay-debt',
    loadChildren: () => import('./pay-debt/pay-debt.module').then(m => m.PayDebtModule),
    data: { permissionCode: ['E60'] }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageFinanceRoutingModule { }
