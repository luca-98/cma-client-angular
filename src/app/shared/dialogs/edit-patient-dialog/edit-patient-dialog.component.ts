import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { PatientService } from 'src/app/core/service/patient.service';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';
import { convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-edit-patient-dialog',
  templateUrl: './edit-patient-dialog.component.html',
  styleUrls: ['./edit-patient-dialog.component.scss']
})
export class EditPatientDialogComponent implements OnInit {

  patientForm: FormGroup;
  today = moment(new Date());


  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private patientService: PatientService,
    public dialogRef: MatDialogRef<EditPatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    this.patientForm = this.formBuilder.group({
      id: [],
      patientCode: [],
      debt: ['0'],
      patientName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    }, { validator: this.phoneValidator });
    this.patientForm.patchValue(data.patientForm);
  }


  ngOnInit(): void {
    this.patientForm.get('patientCode').disable();
    this.patientForm.get('debt').disable();
  }
  save() {
    const patient = {
      id: this.patientForm.get('id').value,
      patientName: this.patientForm.get('patientName').value.trim(),
      dateOfBirth: this.convertDateToNormal(this.patientForm.get('dateOfBirth').value),
      gender: this.patientForm.get('gender').value,
      address: this.patientForm.get('address').value.trim(),
      phone: this.patientForm.get('phone').value.trim()
    };
    if (patient.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }
    if (patient.phone.length !== 10 || !(/^\d+$/.test(patient.phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }

    if (patient.dateOfBirth === '') {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không được để trống');
      return;
    }

    if (patient.gender === '') {
      this.openNotifyDialog('Lỗi', 'Giới tính không được để trống');
      return;
    }

    if (patient.address === '') {
      this.openNotifyDialog('Lỗi', 'Địa chỉ không được để trống');
      return;
    }
    if (!this.onDobChange()) {
      return;
    }


    this.patientService.editPatient(patient)
      .subscribe(
        () => {
          this.openNotifyDialog('Thông báo', 'Sửa thông tin bệnh nhân thành công');
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi sửa thông tin bệnh nhân');
        }
      );
    this.dialogRef.close();

  }

  onPhoneInput() {
    if (this.patientForm.hasError('phoneError')) {
      this.patientForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.patientForm.get('phone').setErrors(null);
    }
  }
  phoneValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
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
  }

  convertDateToNormal(d: any): string {
    if (!d) {
      return d;
    }
    const date = d._d.getDate();
    const month = d._d.getMonth() + 1;
    const year = d._d.getFullYear();
    return date + '/' + month + '/' + year;

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

  onDobChange() {
    const dob = this.patientForm.get('dateOfBirth').value;
    if (dob === null) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return false;
    }
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(dob) && !dob._isAMomentObject) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return false;
    }
    if (dob.isAfter(this.today)) {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không đúng định dạng hoặc vượt quá ngày hiện tại.');
      return false;
    }
  }

}
