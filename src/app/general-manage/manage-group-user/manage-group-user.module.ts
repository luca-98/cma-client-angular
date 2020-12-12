import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageGroupUserRoutingModule } from './manage-group-user-routing.module';
import { ManageGroupUserComponent } from './manage-group-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogAddEditComponent } from './dialog-add-edit/dialog-add-edit.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ManageGroupUserComponent, DialogAddEditComponent],
  imports: [
    CommonModule,
    ManageGroupUserRoutingModule,
    MatButtonModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule
  ]
})
export class ManageGroupUserModule { }
