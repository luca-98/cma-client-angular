import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReceivePatientComponent } from './receive-patient.component';

const routes: Routes = [
  { path: '', component: ReceivePatientComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceivePatientRoutingModule { }
