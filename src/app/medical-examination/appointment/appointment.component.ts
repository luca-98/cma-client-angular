import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
  patientForm: FormGroup;
  autoByName = [];
  autoByPhone = [];
  doctorList = [];
  roomList = [];
  timer;
  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  listAppointment = [
    {
      isShow: true
    },
    {
      isShow: false
    }
  ];
  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Đăng ký hẹn khám');
    this.sideMenuService.changeItem(1.7);
    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      examinationReason: [''],
      doctorId: ['', [Validators.required]],
      appointmentDate: [''],
      appointmentHour: ['']
    });
    this.getDoctorList();
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

  doctorChange(event: any) {
    const id = event.value;
    for (const d of this.doctorList) {
      if (d.id === id) {
        this.patientForm.patchValue({
          roomId: d.roomServicesId[0]
        });
        break;
      }
    }
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


  generateAutoPatientByPhone(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }
      const value = this.patientForm.get('phone').value.trim();
      if (value.length === 0) {
        return;
      }
      this.commonService.searchByPhone(value)
        .subscribe(
          (data: any) => {
            this.autoByPhone = data.message;
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  generateAutoPatientByName(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }
      const value = this.patientForm.get('patientName').value.trim();
      if (value.length === 0) {
        return;
      }
      this.commonService.searchByName(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByName = data.message;
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }
  resetInput() {
    this.autoByName = [];
    this.autoByPhone = [];
    this.patientForm.reset();
  }

  autoSelected(event: any) {
    this.resetInput();
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      patientName: event.patientName,
      dateOfBirth: date,
      phone: event.phone
    });

  }

  onPageEvent($event) {

  }

}
