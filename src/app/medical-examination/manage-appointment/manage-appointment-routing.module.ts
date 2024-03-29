import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageAppointmentComponent } from './manage-appointment.component';

const routes: Routes = [
  { path: '', component: ManageAppointmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageAppointmentRoutingModule { }
