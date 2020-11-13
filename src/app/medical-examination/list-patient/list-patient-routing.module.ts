import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailInforComponent } from './detail-infor/detail-infor.component';
import { ListPatientComponent } from './list-patient.component';

const routes: Routes = [
  { path: '', component: ListPatientComponent },
  { path: 'detail-infor', component: DetailInforComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListPatientRoutingModule { }
