import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import * as moment from 'moment';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { CommonService } from 'src/app/core/service/common.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { RoomService } from 'src/app/core/service/room.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';

@Component({
  selector: 'app-appoint-subclinical',
  templateUrl: './appoint-subclinical.component.html',
  styleUrls: ['./appoint-subclinical.component.scss', '../../share-style.scss']
})
export class AppointSubclinicalComponent implements OnInit {

  patientForm: FormGroup;
  listGroupService = [];
  listService = [];
  listDoctor = [];
  listRoom = [];

  listServiceSelected = [];
  selectedGroupServiceCode = '0';
  searchGroupServiceName = '';

  checkboxesArray = [];

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
    private router: Router,
    private subclinicalService: SubclinicalService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Chỉ định dịch vụ cận lâm sàng');
    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.getAllGroupServiceAndService();

    // TODO get thông tin khởi tạo màn hình
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

  getAllGroupServiceAndService() {
    this.groupService.getAllGroupService()
      .subscribe(
        (data: any) => {
          this.listGroupService = data.message;
          const i = this.listGroupService.findIndex(x => x.groupServiceCode === 'CLINICAL_EXAMINATION');
          this.listGroupService.splice(i, 1);
          this.listService = [];
          this.listDoctor = [];
          this.listRoom = [];
          for (const e of this.listGroupService) {
            this.appendListService(e.groupServiceCode);
            this.appendListDoctoc(e.groupServiceCode);
            this.appendListRoom(e.groupServiceCode);
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách nhóm dịch vụ');
        }
      );
  }

  appendListService(groupServiceCode: any) {
    this.clinicService.getAllServiceByGroupService(groupServiceCode)
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            e.checkBox = false;
            e.isSearchResult = false;
            e.doctorSelected = '';
            e.roomSelected = '';
            e.status = 'Chưa khám';
            e.groupServiceCode = groupServiceCode;
          }
          this.listService = [
            ...this.listService,
            ...data.message
          ];
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
  }

  appendListDoctoc(groupServiceCode: any) {
    this.staff.getDoctorByGroupServiceCode(groupServiceCode)
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            e.groupServiceCode = groupServiceCode;
          }
          this.listDoctor = [
            ...this.listDoctor,
            ...data.message
          ];
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
  }

  appendListRoom(groupServiceCode: any) {
    this.room.getRoomByGroupServiceCode(groupServiceCode)
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            e.groupServiceCode = groupServiceCode;
          }
          this.listRoom = [
            ...this.listRoom,
            ...data.message
          ];
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
  }

  handleSelectService(service: any) {
    if (!service.checkBox) {
      this.subclinicalService.getStaffMinByService(service.id)
        .subscribe(
          (data: any) => {
            service.doctorSelected = data.message.id;
            for (const room of this.listRoom) {
              for (const staffId of room.staffIdList) {
                if (staffId === data.message.id) {
                  service.roomSelected = room.id;
                }
              }
            }
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
          }
        );
      this.listServiceSelected.push(service);
    } else {
      const i = this.listServiceSelected.findIndex(x => x.id === service.id);
      this.listServiceSelected.splice(i, 1);
    }
  }

  removeService(service: any) {
    const i = this.listServiceSelected.findIndex(x => x.id === service.id);
    this.listServiceSelected.splice(i, 1);
    this.listService.find(x => x.id === service.id).checkBox = false;
  }

  findService() {
    this.selectedGroupServiceCode = '-1';
    const a = removeSignAndLowerCase(this.searchGroupServiceName);
    if (a.length === 0) {
      this.selectedGroupServiceCode = '0';
      return;
    }
    for (const service of this.listService) {
      if (removeSignAndLowerCase(service.serviceName).includes(a)) {
        service.isSearchResult = true;
      } else {
        service.isSearchResult = false;
      }
    }
  }

  onChangeDoctor(service: any) {
    for (const room of this.listRoom) {
      for (const staffId of room.staffIdList) {
        if (staffId === service.doctorSelected) {
          service.roomSelected = room.id;
          return;
        }
      }
    }
    service.roomSelected = '';
  }

  onChangeRoom(service: any) {
    for (const staff of this.listDoctor) {
      for (const roomId of staff.roomServicesId) {
        if (roomId === service.roomSelected) {
          service.doctorSelected = staff.id;
          return;
        }
      }
    }
    service.doctorSelected = '';
  }

  groupServiceChange() {
    this.searchGroupServiceName = '';
    for (const service of this.listService) {
      service.isSearchResult = false;
    }
  }

  back() {
    this.router.navigate(['/medical-examination/clinical-examination']);
  }

  // hanldeSelectPatientService(service, event) {
  //   console.log(this.listPatientService);
  //   if (event.target.childNodes[0].nodeName === 'INPUT') {
  //     if (event.target.childNodes[0].checked === false) {
  //       service.code = this.selectedGroupServiceCode;
  //       service.doctor = this.listDoctor;
  //       service.room = this.listRoom;
  //       this.listPatientService.push(service);
  //     } else {
  //       const i = this.listPatientService.findIndex(x => x.id === service.id);
  //       this.listPatientService.splice(i, 1);
  //     }
  //   }
  // }

  // hanldeSelectDoctor(item, doctor) {
  //   for (const iterator of doctor.roomServicesId) {
  //     for (const iterator2 of this.listRoom) {
  //       if (iterator === iterator2.id) {
  //         item.roomSelected = iterator2.id;
  //         return;
  //       }
  //     }
  //   }
  // }

  // hanldeSelectRoom(item, room) {
  //   console.log(room);
  //   console.log(this.listDoctor);
  //   for (const iterator of room.staffIdList) {
  //     for (const iterator2 of this.listDoctor) {
  //       if (iterator === iterator2.id) {
  //         item.doctorSelected = iterator2.id;
  //         return;
  //       }
  //     }
  //   }
  // }

}
