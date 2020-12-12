import { Component, Inject, OnInit } from '@angular/core';
import { ValidatorFn, FormGroup, ValidationErrors, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  selector: 'app-dialog-change-password',
  templateUrl: './dialog-change-password.component.html',
  styleUrls: ['./dialog-change-password.component.scss']
})
export class DialogChangePasswordComponent implements OnInit {

  formGroup: FormGroup;
  fullName: any;
  userName: any;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.fullName = data.fullName;
    this.userName = data.userName;
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      newPassword: ['', [Validators.required]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validator: passwordMatchValidator });
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
    this.dialogRef.close({
      newPassword: this.formGroup.get('newPassword').value
    });
  }
}
