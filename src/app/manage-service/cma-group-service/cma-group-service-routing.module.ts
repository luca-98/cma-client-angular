import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CmaGroupServiceComponent } from './cma-group-service.component';

const routes: Routes = [
  { path: '', component: CmaGroupServiceComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmaGroupServiceRoutingModule { }
