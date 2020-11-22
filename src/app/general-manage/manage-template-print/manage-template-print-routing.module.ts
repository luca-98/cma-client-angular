import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditComponent } from './edit/edit.component';
import { ManageTemplatePrintComponent } from './manage-template-print.component';

const routes: Routes = [
  { path: '', component: ManageTemplatePrintComponent },
  { path: 'edit', component: EditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageTemplatePrintRoutingModule { }
