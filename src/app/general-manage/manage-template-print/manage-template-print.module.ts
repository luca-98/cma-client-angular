import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageTemplatePrintRoutingModule } from './manage-template-print-routing.module';
import { ManageTemplatePrintComponent } from './manage-template-print.component';
import { EditComponent } from './edit/edit.component';
import { ContextMenuComponent } from './edit/context-menu/context-menu.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EditorModule } from 'src/app/editor/editor.module';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [ManageTemplatePrintComponent, EditComponent, ContextMenuComponent],
  imports: [
    CommonModule,
    ManageTemplatePrintRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    EditorModule,
    MatTooltipModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatSelectModule,
  ]
})
export class ManageTemplatePrintModule { }
