import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { GroupUserService } from 'src/app/core/service/group-user.service';
import { RoomService } from 'src/app/core/service/room.service';

const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('password').value === formGroup.get('confirmPassword').value) {
    return null;
  } else {
    return {
      passwordMismatch: true
    };
  }
};

const phoneValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  let phone = formGroup.get('phone').value;
  if (!phone) {
    return {
      phoneError: true
    };
  } else {
    phone = phone.trim();
  }
  if (phone.length !== 10 || !(/^\d+$/.test(phone))) {
    return {
      phoneError: true
    };
  } else {
    return null;
  }
};

@Component({
  selector: 'app-dialog-add-edit',
  templateUrl: './dialog-add-edit.component.html',
  styleUrls: ['./dialog-add-edit.component.scss', '../../../medical-examination/share-style.scss']
})
export class DialogAddEditComponent implements OnInit {

  staff: any;
  isEdit: boolean;
  title: string;
  formGroup: FormGroup;
  listGroupUser = [];
  listGroupService = [];
  listRoomService = [];

  roomId = -1;

  today = moment(new Date());

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private groupUserService: GroupUserService,
    private groupServiceService: GroupServiceService,
    private roomService: RoomService
  ) {
    this.isEdit = data.isEdit;
    this.staff = data.staff;
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.title = 'Sửa thông tin người dùng';
    } else {
      this.title = 'Thêm mới người dùng';
    }
    this.formGroup = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      userGroupId: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required]],
      address: ['', [Validators.required]]
    }, {
      validator: [passwordMatchValidator, phoneValidator]
    });

    this.getListGroupUser();
    this.getListGroupService();

    if (this.staff != null) {
      this.formGroup.patchValue({
        userName: this.staff.userName,
        userGroupId: this.staff.userGroupId,
        fullName: this.staff.fullName,
        dateOfBirth: moment(new Date(this.staff.dateOfBirth)),
        phone: this.staff.phone,
        email: this.staff.email,
        address: this.staff.address
      });
    }
  }

  getListGroupUser() {
    this.groupUserService.getAllGroupUser()
      .subscribe(
        (data: any) => {
          this.listGroupUser = data.message;
        },
        () => {
          console.log('error to call api');
        }
      );
  }

  getListGroupService() {
    this.groupServiceService.getAllGroupService()
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            e.checked = false;
          }
          this.listGroupService = data.message;
          if (this.isEdit) {
            this.getGroupServiceStaff();
            this.getCurrentRoom();
          }
        },
        () => {
          console.log('error to call api');
        }
      );
  }

  getCurrentRoom() {
    this.roomService.getCurrentRoomByStaff(this.staff.staffId)
      .subscribe(
        (data: any) => {
          this.roomId = data.message;
          if (this.roomId == null) {
            this.roomId = -1;
          }
        },
        () => {
          console.log('error to call api');
        }
      );
  }

  getGroupServiceStaff() {
    this.groupServiceService.getGroupServiceByStaffStaffId(this.staff.staffId)
      .subscribe(
        (data: any) => {
          for (const e of this.listGroupService) {
            for (const e1 of data.message) {
              if (e.id == e1) {
                e.checked = true;
                this.roomService.getRoomByGroupServiceCode(e.groupServiceCode)
                  .subscribe(
                    (data2: any) => {
                      for (const e2 of data2.message) {
                        const index = this.listRoomService.findIndex(x => x.id == e2.id);
                        if (index == -1) {
                          this.listRoomService.push(e2);
                        }
                      }
                    },
                    () => {
                      console.log('error to call api');
                    }
                  );
              }
            }
          }
        },
        () => {
          console.log('error to call api');
        }
      );
  }

  submit() {
    const groupServiceList = [];
    for (const e of this.listGroupService) {
      if (e.checked) {
        groupServiceList.push(e.id);
      }
    }
    this.dialogRef.close({
      formGroup: this.formGroup,
      groupServiceList,
      roomId: this.roomId
    });
  }

  onPhoneInput() {
    if (this.formGroup.hasError('phoneError')) {
      this.formGroup.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.formGroup.get('phone').setErrors(null);
    }
  }

  onConfirmPasswordInput() {
    if (this.formGroup.hasError('passwordMismatch')) {
      this.formGroup.get('confirmPassword').setErrors([{ incorrect: true }]);
    } else {
      this.formGroup.get('confirmPassword').setErrors(null);
    }
  }

  onDobChange() {
    const dob = this.formGroup.get('dateOfBirth').value;
    if (dob === null) {
      this.formGroup.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(dob) && !dob._isAMomentObject) {
      this.formGroup.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    if (dob.isAfter(this.today)) {
      this.formGroup.patchValue({
        dateOfBirth: this.today
      });
    }
  }

  async checkGroupService(event: any, item: any) {
    this.listRoomService = [];
    for (const e of this.listGroupService) {
      if (e.checked) {
        await this.roomService.getRoomByGroupServiceCode(e.groupServiceCode)
          .toPromise()
          .then(
            (data: any) => {
              for (const e of data.message) {
                const index = this.listRoomService.findIndex(x => x.id == e.id);
                if (index == -1) {
                  this.listRoomService.push(e);
                }
              }
            },
            () => {
              console.log('error to call api');
            }
          );
      }
    }
    for (const e of this.listRoomService) {
      if (e.id == this.roomId) {
        return;
      }
    }
    this.roomId = -1;
    console.log(this.roomId);
  }
}
