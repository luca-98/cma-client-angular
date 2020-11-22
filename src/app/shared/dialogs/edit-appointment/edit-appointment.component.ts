import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/service/appointment.service';
import { CommonService } from 'src/app/core/service/common.service';
import { convertDateToNormal } from '../../share-func';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-edit-appointment',
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.scss']
})
export class EditAppointmentComponent implements OnInit {

  patientForm: FormGroup;
  doctorList = [];
  roomList = [];
  timer;
  selectedDoctor: any;
  date = new Date();

  today = moment(new Date());

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EditAppointmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService,
    private appointmentService: AppointmentService


  ) {
    this.patientForm = this.formBuilder.group({
      appointmentId: [''],
      id: [],
      patientCode: [],
      patientName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      staffId: [''],
      appointmentDate: [''],
      appointmentTime: [''],
      status: ['1']
    });
    this.patientForm.patchValue(data.patientForm);
    this.patientForm.disable();
    this.getDoctorList();
    this.patientForm.get('appointmentDate').enable();
    this.patientForm.get('appointmentTime').enable();
    this.patientForm.get('staffId').enable();
    this.patientForm.get('status').enable();
  }
  getDoctorList() {
    this.commonService.getAllDoctor()
      .subscribe(
        (data: any) => {
          this.doctorList = data.message;
          this.selectedDoctor = this.doctorList.find(e => e.id === this.patientForm.get('staffId').value);
        },
        () => {
          console.error('error call api');
        }
      );
  }
  selectDoctor(doctor) {
    this.selectedDoctor = doctor;
  }

  ngOnInit(): void {
    this.patientForm.get('patientCode').disable();
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

  convertDateToNormal(d: any): string {
    if (!d) {
      return d;
    }
    const date = d._d.getDate();
    const month = d._d.getMonth() + 1;
    const year = d._d.getFullYear();
    return date + '/' + month + '/' + year;

  }
  changeStatus(id, status) {
    this.appointmentService.changeStatus(id, status)
      .subscribe(
        (data: any) => {
          this.openNotifyDialog('Thông báo', 'Hủy khám thành công.');

        },
        () => {
          this.openNotifyDialog('Lỗi', 'Có lỗi xảy ra trong quá trình hủy khám.');
        }
      );
  }

  save() {
    if (this.patientForm.get('status').value === '1') {
      const dataPost = {
        appointmentDate: convertDateToNormal(this.patientForm.get('appointmentDate').value),
        appointmentTime: this.patientForm.get('appointmentTime').value,
        staffId: this.patientForm.get('staffId').value ? this.patientForm.get('staffId').value : '',
        appointmentId: this.patientForm.get('appointmentId').value,
      };
      this.appointmentService.editAppointmentCreated(dataPost).subscribe(
        (data: any) => {
          if (!data.message.timeExist) {
            this.openNotifyDialog('Thông báo', 'Thêm thông tin hẹn khám thành công');
            this.dialogRef.close();
          } else {
            this.openNotifyDialog('Lỗi', 'Bạn không thể đặt lịch hẹn khám cho bác sĩ "' + this.selectedDoctor.fullName + '" vì đang có lịch hẹn khám khác vào khoảng thời gian này ngày ' + dataPost.appointmentDate + '. Hệ thống sẽ tự động tăng thời gian thêm 15 phút, vui lòng kiểm tra và lưu thông tin lại.');
            const time = dataPost.appointmentTime.split(':');
            let hour = parseInt(time[0], 10);
            let minute = parseInt(time[1], 10);
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
        (error) => {
          this.openNotifyDialog('Lỗi', 'Có lỗi xảy ra trong quá trình thay đổi thông tin hẹn khám.');
          this.dialogRef.close();
        }
      );
    }
    else {
      this.changeStatus(this.patientForm.get('appointmentId').value, 0);
      this.dialogRef.close();
    }

  }

}
