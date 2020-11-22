import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddEditTemplateComponent } from './add-edit-template/add-edit-template.component';
import { TemplateReportComponent } from './template-report.component';

const routes: Routes = [
  { path: '', component: TemplateReportComponent },
  { path: 'edit', component: AddEditTemplateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateReportRoutingModule { }
