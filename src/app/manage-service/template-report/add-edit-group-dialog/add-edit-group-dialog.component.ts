import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-edit-group-dialog',
  templateUrl: './add-edit-group-dialog.component.html',
  styleUrls: ['./add-edit-group-dialog.component.scss']
})
export class AddEditGroupDialogComponent implements OnInit {
  title: string;
  groupData: any;

  constructor(
    public dialogRef: MatDialogRef<AddEditGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.groupData = {
      reportName: data.reportName
    };
  }

  ngOnInit() {
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
