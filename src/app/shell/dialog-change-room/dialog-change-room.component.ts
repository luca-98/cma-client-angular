import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/core/service/common.service';

@Component({
  selector: 'app-dialog-change-room',
  templateUrl: './dialog-change-room.component.html',
  styleUrls: ['./dialog-change-room.component.scss']
})
export class DialogChangeRoomComponent implements OnInit {

  roomService = [];
  formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogChangeRoomComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.roomService = this.data.roomService;
    this.formGroup = this.formBuilder.group({
      room: [this.data.currentRoomId]
    });
  }

  changeRoom() {
    for (const room of this.roomService) {
      if (room.id === this.formGroup.get('room').value) {
        this.dialogRef.close({
          room
        });
        return;
      }
    }
  }

}
