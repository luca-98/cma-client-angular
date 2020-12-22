import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-add-edit-dialog',
  templateUrl: './add-edit-dialog.component.html',
  styleUrls: ['./add-edit-dialog.component.scss', '../../../medical-examination/share-style.scss']
})
export class AddEditDialogComponent implements OnInit {

  title: any;
  formGroup: FormGroup;
  isEdit: any;
  room: any;
  listCurrentRoom: any;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
  ) {
    this.isEdit = data.isEdit;
    this.room = data.room;
    this.listCurrentRoom = data.listCurrentRoom;
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

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      roomServiceName: ['', [Validators.required]],
    });

    if (this.isEdit) {
      this.title = 'Sửa phòng làm việc';
      this.formGroup.patchValue({
        roomServiceName: this.room ? this.room.roomName : ''
      });
    } else {
      this.title = 'Thêm mới phòng làm việc';
    }
  }

  submit() {
    const roomServiceName = this.formGroup.get('roomServiceName').value;
    for (const e of this.listCurrentRoom) {
      if (this.isEdit && e.id == this.room.id){
        continue;
      }
      if (e.roomName == roomServiceName) {
        this.openNotifyDialog('Lỗi', 'Tên phòng làm việc này đã được sử dụng');
        return;
      }
    }
    this.dialogRef.close({
      roomServiceName,
    });
  }
}
