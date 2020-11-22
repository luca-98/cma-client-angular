import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditorComponent } from './editor.component';
import { TablePickerComponent } from './table-picker/table-picker.component';
import { LineSpacingPickerComponent } from './line-spacing-picker/line-spacing-picker.component';
import { FormsModule } from '@angular/forms';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  declarations: [EditorComponent, TablePickerComponent, LineSpacingPickerComponent, ContextMenuComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    FormsModule,
    MatMenuModule
  ],
  exports: [
    EditorComponent
  ]
})
export class EditorModule { }
