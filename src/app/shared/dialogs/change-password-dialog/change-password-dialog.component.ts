import { Component, Inject, OnInit } from '@angular/core';
import { ValidatorFn, FormGroup, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/core/service/common.service';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('newPassword').value === formGroup.get('confirmNewPassword').value) {
    return null;
  } else {
    return {
      passwordMismatch: true
    };
  }
};

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validator: passwordMatchValidator });
  }

  get oldPassword() {
    return this.formGroup.get('oldPassword');
  }

  get newPassword() {
    return this.formGroup.get('newPassword');
  }

  get confirmNewPassword() {
    return this.formGroup.get('confirmNewPassword');
  }

  onPasswordInput() {
    if (this.formGroup.hasError('passwordMismatch')) {
      this.confirmNewPassword.setErrors([{ passwordMismatch: true }]);
    } else {
      this.confirmNewPassword.setErrors(null);
    }
  }

  changePassword() {
    this.commonService.changePassword(this.formGroup.get('oldPassword').value, this.formGroup.get('newPassword').value)
      .subscribe(
        (data: any) => {
          if (data.message) {
            this.dialog.open(NotifyDialogComponent, {
              width: '350px',
              disableClose: true,
              autoFocus: false,
              data: { title: 'Thông báo', content: 'Đổi mật khẩu thành công' },
            });
            this.dialogRef.close();
          } else {
            this.dialog.open(NotifyDialogComponent, {
              width: '350px',
              disableClose: true,
              autoFocus: false,
              data: { title: 'Lỗi', content: 'Mật khẩu cũ không đúng' },
            });
          }
        },
        () => {
          this.dialog.open(NotifyDialogComponent, {
            width: '350px',
            disableClose: true,
            autoFocus: false,
            data: { title: 'Lỗi', content: 'Thực hiện thao tác không thành công, vui lòng thử lại' },
          });
          this.dialogRef.close();
        }
      );
  }
}
