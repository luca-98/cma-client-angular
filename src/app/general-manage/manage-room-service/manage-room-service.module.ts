import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageRoomServiceRoutingModule } from './manage-room-service-routing.module';
import { ManageRoomServiceComponent } from './manage-room-service.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddEditDialogComponent } from './add-edit-dialog/add-edit-dialog.component';


@NgModule({
  declarations: [ManageRoomServiceComponent, AddEditDialogComponent],
  imports: [
    CommonModule,
    ManageRoomServiceRoutingModule,
    MatButtonModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ]
})
export class ManageRoomServiceModule { }
