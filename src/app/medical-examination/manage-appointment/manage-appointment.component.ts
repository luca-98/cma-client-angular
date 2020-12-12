import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/service/appointment.service';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { AddAppoinmentComponent } from 'src/app/shared/dialogs/add-appoinment/add-appoinment.component';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { EditAppointmentComponent } from 'src/app/shared/dialogs/edit-appointment/edit-appointment.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-manage-appointment',
  templateUrl: './manage-appointment.component.html',
  styleUrls: ['./manage-appointment.component.scss']
})
export class ManageAppointmentComponent implements OnInit {
  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  patientForm: FormGroup;
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  timer;
  listAppointment = [];
  today = moment(new Date());
  searchData = {
    patientCode: '',
    patientName: '',
    phone: '',
    startDate: this.today,
    endDate: this.today,
    status: ''
  };
  isLoading = false;

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private credentialsService: CredentialsService,
  ) {
    this.menuService.reloadMenu.subscribe(() => {
      const listPermission = route.snapshot.data.permissionCode;
      const newListPermission = this.credentialsService.credentials.permissionCode;
      for (const e of listPermission) {
        const index = newListPermission.findIndex(x => x == e);
        if (index == -1) {
          location.reload();
        }
      }
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Hẹn khám');
    this.sideMenuService.changeItem(1.8);
    this.searchAppointment();
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

  openAddDialog() {
    return this.dialog.open(AddAppoinmentComponent, {
      width: '700px',
      disableClose: true,
      autoFocus: false,
    });
  }

  openEditDialog(item: any) {
    const patient = item.patient;
    const patientForm = {
      appointmentId: item.id,
      id: patient.id,
      patientCode: patient.patientCode,
      debt: patient.debt,
      patientName: patient.patientName,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth ? moment(new Date(patient.dateOfBirth)) : '',
      gender: patient.gender === null ? '' : patient.gender.toString(),
      address: patient.address,
      appointmentDate: moment(new Date(item.dayOfExamination)),
      appointmentTime: item.time,
      staffId: item.staff.id
    };

    return this.dialog.open(EditAppointmentComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        patientForm
      },
    });
  }

  editPatient(item: any) {
    const dialogRef = this.openEditDialog(item);
    dialogRef.afterClosed().subscribe(result => {
      if (typeof (result) === 'undefined') {
        setTimeout(() => {
          this.searchAppointment();
        }, 300);
      }
    });
  }

  generateAutoPatientByName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.patientName.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.appointmentService.searchByName(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByName = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientName);
              this.autoByName.push({
                value: d.patientName,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }

  generateAutoPatientByCode(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.patientCode.trim().toUpperCase();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.appointmentService.searchByCode(value)
        .subscribe(
          (data: any) => {
            this.autoByPatientCode = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientCode);
              this.autoByPatientCode.push({
                value: d.patientCode,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }

  generateAutoPatientByPhone(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.phone.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.appointmentService.searchByPhone(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByPhone = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.phone);
              this.autoByPhone.push({
                value: d.phone,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }

  addAppointment() {
    const dialogRef = this.openAddDialog();
    dialogRef.afterClosed().subscribe(result => {
      if (typeof (result) === 'undefined') {
        setTimeout(() => {
          this.searchAppointment();
        }, 300);
      }
    });
  }

  getListAppointment() {
    this.isLoading = true;
    this.appointmentService.getAllAppointment(this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
          this.buildListAppointment(data.message.appointmentList);
        },
        () => {
          this.isLoading = false;
          this.openNotifyDialog('Lỗi', 'Tải danh sách hẹn khám thất bại.');
        }
      );
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

  searchAppointment() {
    this.isLoading = true;
    const dataAppontment = {
      patientCode: this.searchData.patientCode,
      patientName: this.searchData.patientName,
      phone: this.searchData.phone,
      startDate: this.convertDateToNormal(this.searchData.startDate),
      endDate: this.convertDateToNormal(this.searchData.endDate),
      status: this.searchData.status
    };

    if (dataAppontment.status === '-1') {
      dataAppontment.status = '';
    }
    this.appointmentService.searchAllAppointment(dataAppontment, this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
          this.buildListAppointment(data.message.appointmentList);
        },
        () => {
          this.isLoading = false;
          this.openNotifyDialog('Lỗi', 'Tải danh sách hẹn khám thất bại.');
        }
      );
  }

  buildListAppointment(list) {
    // tslint:disable-next-line: no-shadowed-variable
    const groups = list.reduce((groups, item) => {
      const date = item.dayOfExamination;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});
    this.listAppointment = Object.keys(groups).map((date) => {
      for (const iterator of groups[date]) {
        iterator.status = iterator.status.toString();
      }
      groups[date].sort((a, b) => {
        const date1 = new Date('1970/01/01 ' + a.time) as any;
        const date2 = new Date('1970/01/01 ' + b.time) as any;
        return date1 - date2;
      });
      return {
        date,
        isShow: true,
        data: groups[date]
      };
    });
    this.listAppointment.sort((a, b) => b.date - a.date);
  }

  openConfirmDialog(title: string, content: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      disableClose: true,
      autoFocus: false,
      data: {
        title,
        content
      },
    });
  }

  onPageEvent(event) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.searchAppointment();
  }


  changeStatus(id, status) {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn hủy khám cho bệnh nhân này không?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.changeStatus(id, status)
          .subscribe(
            (data: any) => {
              this.openNotifyDialog('Thông báo', 'Hủy khám thành công.');
              this.searchAppointment();

            },
            () => {
              this.openNotifyDialog('Lỗi', 'Có lỗi xảy ra trong quá trình hủy khám.');
            }
          );
      }
    });
  }


  reset() {
    this.searchData = {
      patientCode: '',
      patientName: '',
      phone: '',
      startDate: '' as any,
      endDate: '' as any,
      status: ''
    };
    this.searchAppointment();
  }

  isToday(inp: any) {
    const today = new Date();
    const someDate = new Date(+inp);
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear();
  }
}
