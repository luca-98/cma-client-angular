import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-service-report-status',
  templateUrl: './dialog-service-report-status.component.html',
  styleUrls: ['./dialog-service-report-status.component.scss']
})
export class DialogServiceReportStatusComponent {

  dataDisplay: string;

  constructor(
    public dialogRef: MatDialogRef<DialogServiceReportStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataDisplay = data.dataDisplay;
  }
}
