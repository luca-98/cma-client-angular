import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TemplateReportRoutingModule } from './template-report-routing.module';
import { TemplateReportComponent } from './template-report.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddEditGroupDialogComponent } from './add-edit-group-dialog/add-edit-group-dialog.component';
import { AddEditTemplateComponent } from './add-edit-template/add-edit-template.component';
import { ContextMenuComponent } from './add-edit-template/context-menu/context-menu.component';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { EditorModule } from 'src/app/editor/editor.module';


@NgModule({
  declarations: [TemplateReportComponent, AddEditGroupDialogComponent, AddEditTemplateComponent, ContextMenuComponent],
  imports: [
    CommonModule,
    TemplateReportRoutingModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCardModule,
    MatFormFieldModule,
    EditorModule,
    MatTooltipModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatSelectModule,
  ],
  entryComponents: [
    AddEditGroupDialogComponent
  ]
})
export class TemplateReportModule { }
