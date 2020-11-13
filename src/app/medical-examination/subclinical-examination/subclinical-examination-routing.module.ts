import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubclinicalExaminationComponent } from './subclinical-examination.component';

const routes: Routes = [
  { path: '', component: SubclinicalExaminationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubclinicalExaminationRoutingModule { }
