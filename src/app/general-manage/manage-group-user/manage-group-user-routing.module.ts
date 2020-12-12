import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageGroupUserComponent } from './manage-group-user.component';

const routes: Routes = [
  { path: '', component: ManageGroupUserComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageGroupUserRoutingModule { }
