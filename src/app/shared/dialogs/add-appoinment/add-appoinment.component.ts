import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/service/appointment.service';
import { CommonService } from 'src/app/core/service/common.service';
import { convertDateToNormal, propValToString } from '../../share-func';
import { EditPatientDialogComponent } from '../edit-patient-dialog/edit-patient-dialog.component';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-add-appoinment',
  templateUrl: './add-appoinment.component.html',
  styleUrls: ['./add-appoinment.component.scss']
})
export class AddAppoinmentComponent implements OnInit {

  patientForm: FormGroup;
  doctorList = [];
  roomList = [];
  autoByPatientCode = [];
  timer;
  today = moment(new Date());
  date = new Date();
  selectedDoctor: any;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EditPatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService,
    private appoinmentService: AppointmentService
  ) { }


  ngOnInit(): void {
    this.patientForm = this.formBuilder.group({
      patientCode: [''],
      patientName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      dateOfBirth: [''],
      gender: [''],
      staffId: [''],
      address: [''],
      appointmentDate: [''],
      appointmentTime: [''],
      debt: ['0']
    });
    this.getDoctorList();
    this.patientForm.patchValue({
      appointmentDate: this.today,
      appointmentTime: this.date.getHours() + ':' + this.date.getMinutes()
    });
    this.patientForm.get('patientCode').disable();
  }

  getDoctorList() {
    this.commonService.getAllDoctor()
      .subscribe(
        (data: any) => {
          this.doctorList = data.message;
        },
        () => {
          console.error('error call api');
        }
      );
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
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(this.patientForm.get('dateOfBirth').value)) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    if (this.patientForm.get('dateOfBirth').value.isAfter(this.today)) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
    }
  }

  save() {
    const appointmentData = {
      patientCode: this.patientForm.get('patientCode').value.trim(),
      patientName: this.patientForm.get('patientName').value.trim(),
      phone: this.patientForm.get('phone').value.trim(),
      dateOfBirth: convertDateToNormal(this.patientForm.get('dateOfBirth').value),
      gender: this.patientForm.get('gender').value,
      staffId: this.patientForm.get('staffId').value,
      address: this.patientForm.get('address').value.trim(),
      appointmentDate: convertDateToNormal(this.patientForm.get('appointmentDate').value),
      appointmentTime: this.patientForm.get('appointmentTime').value,
      debt: this.patientForm.get('debt').value
    };
    if (this.autoByPatientCode.findIndex(i => i.patientCode === appointmentData.patientCode) === -1 && appointmentData.patientCode !== '') {
      this.openNotifyDialog('Lỗi', 'Mã bệnh nhân không tồn tại trong hệ thống');
      return;
    }

    if (appointmentData.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }

    if (appointmentData.phone.length !== 10 || !(/^\d+$/.test(appointmentData.phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }
    if (appointmentData.appointmentDate === '') {
      this.openNotifyDialog('Lỗi', 'Ngày hẹn không được để trống');
      return;
    }
    if (appointmentData.appointmentTime === '') {
      this.openNotifyDialog('Lỗi', 'Giờ hẹn không được để trống');
      return;
    }

    this.appoinmentService.addPatientAppointment(appointmentData)
      .subscribe(
        (data: any) => {
          if (!data.message.timeExist) {
            this.openNotifyDialog('Thông báo', 'Thêm thông tin hẹn khám thành công');
            this.dialogRef.close();

          } else {
            this.openNotifyDialog('Lỗi', 'Bạn không thể đặt lịch hẹn khám cho bác sĩ "' + this.selectedDoctor.fullName + '" vì đang có lịch hẹn khám khác vào khoảng thời gian này ngày ' + appointmentData.appointmentDate + '. Hệ thống sẽ tự động tăng thời gian thêm 15 phút, vui lòng kiểm tra và lưu thông tin lại.');
            const time = appointmentData.appointmentTime.split(':');
            let hour = parseInt(time[0]);
            let minute = parseInt(time[1]);
            minute += 15;
            if (minute >= 60) {
              hour++;
              minute -= 60;
            }
            if (hour > 23) {
              hour = 0;
              this.patientForm.patchValue({
                appointmentDate: this.patientForm.get('appointmentDate').value.add(1, 'day')
              });
            }
            this.patientForm.patchValue({
              appointmentTime: hour + ':' + minute
            });
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Thêm thông tin hẹn khám thất bại');
        }
      );
  }

  selectDoctor(doctor) {
    this.selectedDoctor = doctor;
  }

  generateAutoPatientByPatientCode(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.patientForm.get('patientName').reset();
      this.patientForm.get('dateOfBirth').reset();
      this.patientForm.get('gender').reset();
      this.patientForm.get('address').reset();
      this.patientForm.get('phone').reset();
      this.patientForm.get('staffId').reset();
      this.patientForm.enable();
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }

      if (this.patientForm.get('patientCode').value.length === 0) {
        return;
      }
      this.commonService.searchByPatientCode(this.patientForm.get('patientCode').value.toUpperCase())
        .subscribe(
          (data: any) => {
            this.autoByPatientCode = data.message;
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  autoSelected(event: any) {
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone,
      debt: event.debt
    });
    this.patientForm.get('patientName').disable();
    this.patientForm.get('dateOfBirth').disable();
    this.patientForm.get('gender').disable();
    this.patientForm.get('address').disable();
    this.patientForm.get('phone').disable();
  }
  doubleClick() {
    this.resetInput();
    this.patientForm.get('patientCode').enable();
  }

  resetInput() {
    this.patientForm.get('patientCode').reset();
    this.patientForm.get('patientName').reset();
    this.patientForm.get('dateOfBirth').reset();
    this.patientForm.get('gender').reset();
    this.patientForm.get('address').reset();
    this.patientForm.get('phone').reset();
    this.patientForm.get('staffId').reset();
    this.patientForm.enable();
  }

}
