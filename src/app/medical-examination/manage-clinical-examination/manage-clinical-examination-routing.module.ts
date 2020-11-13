import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageClinicalExaminationComponent } from './manage-clinical-examination.component';

const routes: Routes = [
  { path: '', component: ManageClinicalExaminationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageClinicalExaminationRoutingModule { }
