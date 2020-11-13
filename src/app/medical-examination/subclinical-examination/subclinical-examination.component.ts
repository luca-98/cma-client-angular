import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { CommonService } from 'src/app/core/service/common.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { RoomService } from 'src/app/core/service/room.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-subclinical-examination',
  templateUrl: './subclinical-examination.component.html',
  styleUrls: ['./subclinical-examination.component.scss', '../share-style.scss']
})
export class SubclinicalExaminationComponent implements OnInit {
  patientForm: FormGroup;
  listGroupService = [];
  listService = [];
  listPatientService = [];
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  selectedGroupServiceCode = '';
  searchGroupServiceName = '';
  timer;
  listUserGroupService = [];
  listDoctor = [];
  listRoom = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private groupService: GroupServiceService,
    private clinicService: ClinicServiceService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private staff: StaffService,
    private room: RoomService,

  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Lập phiếu khám cận lâm sàng');
    this.sideMenuService.changeItem(1.5);
    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.getListGroupService();
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

  getListGroupService() {
    this.groupService.getAllGroupService()
      .subscribe(
        (data: any) => {
          this.listGroupService = data.message;
          this.groupService.getGroupServiceByStaff()
            .subscribe(
              (data2: any) => {
                data2.message.forEach(element => {
                  const item = this.listGroupService.find(x => x.id === element);
                  if (item) {
                    this.listUserGroupService.push(item);
                  }
                });
              }
            );
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách nhóm dịch vụ');
        }
      );
  }

  async getListService(groupServiceCode) {
    this.selectedGroupServiceCode = groupServiceCode;
    this.listDoctor = await this.getListDoctorByGroupService(groupServiceCode);
    this.listRoom = await this.getListRoomByGroupService(groupServiceCode);
    this.clinicService.getAllServiceByGroupService(groupServiceCode)
      .subscribe(
        (data: any) => {
          this.listService = [];
          this.listService = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
  }

  async getListDoctorByGroupService(groupServiceCode) {
    let dataDoctor = [];
    this.selectedGroupServiceCode = groupServiceCode;
    await this.staff.getDoctorByGroupServiceCode(groupServiceCode)
      .toPromise()
      .then(
        (data: any) => {
          dataDoctor = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
    return dataDoctor;
  }

  async getListRoomByGroupService(groupServiceCode) {
    let listRoom = [];
    this.selectedGroupServiceCode = groupServiceCode;
    await this.room.getRoomByGroupServiceCode(groupServiceCode)
      .toPromise()
      .then(
        (data: any) => {
          listRoom = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
    return listRoom;
  }

  findServiceInGroupService() {
    if (this.selectedGroupServiceCode !== '') {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.clinicService.findServiceInGroupService(this.searchGroupServiceName, this.selectedGroupServiceCode)
          .subscribe(
            (data: any) => {
              this.listService = [];
              this.listService = data.message;
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi khi tìm kiếm dịch vụ');
            }
          );
      }, 300);
    }
  }


  generateAutoPatientByPatientCode(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
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
    this.autoByPatientCode = [];
    this.autoByPhone = [];
    this.listPatientService = [];
    this.patientForm.reset();
  }

  autoSelected(event: any) {
    this.resetInput();
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone
    });
  }

  hanldeSelectPatientService(service, event) {
    if (event.target.childNodes[0].nodeName === 'INPUT') {
      if (event.target.childNodes[0].checked === false) {
        service.code = this.selectedGroupServiceCode;
        service.doctor = this.listDoctor;
        service.room = this.listRoom;
        this.listPatientService.push(service);
      } else {
        const i = this.listPatientService.findIndex(x => x.id === service.id);
        this.listPatientService.splice(i, 1);
      }
    }
  }

  hanldeSelectDoctor(item, doctor) {
    for (const iterator of doctor.roomServicesId) {
      for (const iterator2 of this.listRoom) {
        if (iterator === iterator2.id) {
          item.roomSelected = iterator2.id;
          return;
        }
      }
    }
  }

  hanldeSelectRoom(item, room) {
    for (const iterator of room.staffIdList) {
      for (const iterator2 of this.listDoctor) {
        if (iterator === iterator2.id) {
          item.doctorSelected = iterator2.id;
          return;
        }
      }
    }
  }
}
