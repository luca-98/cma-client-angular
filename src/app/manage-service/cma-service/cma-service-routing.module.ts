import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CmaServiceComponent } from './cma-service.component';

const routes: Routes = [
  { path: '', component: CmaServiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmaServiceRoutingModule { }
