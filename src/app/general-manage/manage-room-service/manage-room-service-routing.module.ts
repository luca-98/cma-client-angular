import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRoomServiceComponent } from './manage-room-service.component';

const routes: Routes = [
  { path: '', component: ManageRoomServiceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoomServiceRoutingModule { }
