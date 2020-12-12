import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';

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
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,

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

  openNotifyDialog(title: string, content: string) {
    return this.dialog.open(NotifyDialogComponent, {
      width: '350px',
      disableClose: true,
      autoFocus: false,
      data: {
        title,
        content
      },
    });
  }

  save() {
    if (!this.groupData.reportName || this.groupData.reportName.trim() === '') {
      this.openNotifyDialog('Lỗi', 'Tên nhóm kết quả không được để trống.');
      return;
    }
    this.groupData.reportName = this.groupData.reportName.trim();
    this.dialogRef.close(this.groupData);
  }
}
