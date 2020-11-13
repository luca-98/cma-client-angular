import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageSubclinicalExaminationComponent } from './manage-subclinical-examination.component';

const routes: Routes = [
  { path: '', component: ManageSubclinicalExaminationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageSubclinicalExaminationRoutingModule { }
