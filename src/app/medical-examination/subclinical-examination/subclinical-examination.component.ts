import { JsonPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { CommonService } from 'src/app/core/service/common.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { RoomService } from 'src/app/core/service/room.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

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
  medicalExamId = null;
  paid = true;
  today = moment(new Date());
  listChangeStatus = [];


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
    private subclinicalService: SubclinicalService,
    private activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Lập phiếu khám cận lâm sàng');
    this.sideMenuService.changeItem(1.5);
    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['0', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.patientForm.get('patientCode').disable();
    this.getListGroupService();
    this.activatedRoute.queryParams.subscribe(params => {
      this.medicalExamId = params.medicalExamId;
      const interval = setInterval(() => {
        if (this.medicalExamId) {
          if (this.listDoctor.length !== 0 && this.listRoom.length !== 0) {
            this.initInfoSubclinical();
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      }, 300);
    });

  }

  dbClick() {
    this.patientForm.reset();
    this.patientForm.enable();
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
                    if (this.selectedGroupServiceCode === '') {
                      this.selectedGroupServiceCode = this.listUserGroupService[0].groupServiceCode;
                      this.getListService(this.selectedGroupServiceCode);
                    }
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

  getListMedicalExamToday(patientCode) {
    this.subclinicalService.getListMedicalExamToday(patientCode).subscribe(
      (data: any) => {
        if (data.message[0]) {
          this.medicalExamId = data.message[0].id;
          this.initInfoSubclinical();
        }
      }, (error) => {
        this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh phiếu cận lâm sàng');

      }
    );
  }

  async getListService(groupServiceCode) {
    this.selectedGroupServiceCode = groupServiceCode;
    this.getListDoctorByGroupService(groupServiceCode);
    this.getListRoomByGroupService(groupServiceCode);
    this.clinicService.getAllServiceByGroupService(groupServiceCode)
      .subscribe(
        (data: any) => {
          this.listService = [];
          this.listService = data.message;

          for (const iterator of this.listService) {
            iterator.checked = false;
            if (this.listPatientService.length !== 0) {
              this.listPatientService.forEach(element => {
                if (iterator.id === element.id) {
                  iterator.checked = true;
                }
              });
            }
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
  }

  getListDoctorByGroupService(groupServiceCode) {
    this.selectedGroupServiceCode = groupServiceCode;
    this.staff.getDoctorByGroupServiceCode(groupServiceCode)
      .toPromise()
      .then(
        (data: any) => {
          this.listDoctor = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
  }

  getListRoomByGroupService(groupServiceCode) {
    this.selectedGroupServiceCode = groupServiceCode;
    this.room.getRoomByGroupServiceCode(groupServiceCode)
      .toPromise()
      .then(
        (data: any) => {
          this.listRoom = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách dịch vụ');
        }
      );
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
      this.patientForm.patchValue({
        patientName: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phone: ''
      });
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
    this.patientForm.get('patientCode').disable();
    this.listPatientService = [];
    for (const iterator of this.listService) {
      iterator.checked = false;
    }
    this.getListMedicalExamToday(event.patientCode);
  }
  deleteService(id, isClickDeleteButton?) {
    const indexlistPatientService = this.listPatientService.findIndex(x => x.id === id);
    if (indexlistPatientService !== -1) {
      this.listPatientService.splice(indexlistPatientService, 1);
    }
    if (isClickDeleteButton) {
      const index = this.listService.findIndex(x => x.id === id);
      if (index !== -1) {
        this.listService[index].checked = false;
      }
    }
  }

  hanldeSelectPatientService({ ...item }, event) {
    if (event.target.childNodes[0].nodeName === 'INPUT') {
      if (!item.checked) {
        item.code = this.selectedGroupServiceCode;
        item.doctor = this.listDoctor;
        item.room = this.listRoom;
        item.note = '';
        item.summary = '';
        item.status = 1;
        item.doctorSelected = this.listDoctor[0].id;
        this.hanldeSelectDoctor(item, this.listDoctor[0]);
        this.listPatientService.push(item);
        const boxTable = document.querySelector('.js-auto-scroll');
        setTimeout(() => {
          boxTable.scrollTop = boxTable.scrollHeight;
        }, 600);
      } else {
        this.deleteService(item.id);
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
    return true;
  }

  save() {
    const listPatientServiceClone = [];
    console.log(this.listPatientService);
    this.listPatientService.forEach(element => {
      const item = {
        staffId: element.doctorSelected,
        serviceId: element.id,
        summary: element.summary,
        note: element.note,
        status: element.status
        // serviceReportId
      };
      listPatientServiceClone.push(item);
    });

    const dataPost = {
      medicalExamId: this.medicalExamId,
      patientCode: this.patientForm.get('patientCode').value.trim(),
      patientName: this.patientForm.get('patientName').value.trim(),
      phone: this.patientForm.get('phone').value.trim(),
      dateOfBirthStr: convertDateToNormal(this.patientForm.get('dateOfBirth').value),
      gender: parseInt(this.patientForm.get('gender').value, 10),
      address: this.patientForm.get('address').value.trim(),
      listAppoint: listPatientServiceClone
    };
    if (dataPost.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }

    if (dataPost.phone.length !== 10 || !(/^\d+$/.test(dataPost.phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }
    if (dataPost.dateOfBirthStr === '') {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không được để trống');
      return;
    }
    this.onDobChange();

    if (dataPost.address === '') {
      this.openNotifyDialog('Lỗi', 'Địa chỉ không được để trống');
      return;
    }

    this.subclinicalService.updateSubclinical(dataPost).subscribe(
      (data: any) => {
        if (data.message) {
          this.patientForm.patchValue({
            patientCode: data.message.patientCode
          });
          if (this.listChangeStatus.length !== 0) {
            const listAppoint = data.message.listAppoint;
            for (const iterator of this.listChangeStatus) {
              const item = listAppoint.find(e => e.serviceId === iterator);
              if (item) {
                this.subclinicalService.changeStatus(item.serviceReportId, 0).subscribe(
                  (data2: any) => {
                  }, (err) => {
                  }
                );
              }
            }
          }

        }
        this.openNotifyDialog('Thông báo', 'Lưu thông tin phiếu cận lâm sàng thành công.');
      },
      (error) => {
        this.openNotifyDialog('Lỗi', 'Lưu thông tin phiếu cận lâm sàng thất bại.');
      }
    );
  }

  getStatusPayingSubclinical() {
    this.subclinicalService.getStatusPayingSubclinical(this.medicalExamId).subscribe(
      (data: any) => {
        this.paid = data.message;
      }
    );
  }

  initInfoSubclinical() {
    this.subclinicalService.initInfoSubclinical(this.medicalExamId).subscribe(
      (data: any) => {
        if (data.message) {
          const date = moment(new Date(data.message.dateOfBirth));
          this.patientForm.patchValue({
            patientName: data.message.patientName,
            patientCode: data.message.patientCode,
            dateOfBirth: date,
            gender: data.message.gender.toString(),
            address: data.message.address,
            phone: data.message.phone
          });
          this.patientForm.get('patientCode').disable();
          for (const iterator of data.message.listAppoint) {
            if (!iterator.note) {
              iterator.note = '';
            }
            if (!iterator.summary) {
              iterator.summary = '';
            }
            const index = this.listService.findIndex(e => e.id === iterator.serviceId);
            if (index !== -1) {
              this.listService[index].checked = true;
              const item = this.listService[index];
              iterator.serviceName = item.serviceName;
              iterator.price = item.price;
            }
            iterator.id = iterator.serviceId;
            iterator.doctorSelected = iterator.staffId;
            iterator.doctor = this.listDoctor;
            iterator.room = this.listRoom;
            for (const i2 of this.listRoom) {
              for (const i3 of i2.staffIdList) {
                if (iterator.doctorSelected === i3) {
                  iterator.roomSelected = i2.id;
                }
              }
            }
          }
          this.listPatientService = data.message.listAppoint;
          this.getStatusPayingSubclinical();
        }
      }, (err) => {
        this.openNotifyDialog('Lỗi', 'Lấy thông tin phiếu cận lâm sàng thất bại.');

      }
    );
  }

  makeDone(serviceReportId, item) {
    item.status = '0';
    this.listChangeStatus.push(item.id);
    // this.subclinicalService.changeStatus(serviceReportId, 0).subscribe(
    //   (data: any) => {
    //     if (data.message) {
    //       this.openNotifyDialog('Thông báo', 'Thay đổi trạng thái thành công.');
    //       item.status = '0';
    //     }
    //   }, (err) => {
    //     this.openNotifyDialog('Lỗi', 'Thay đổi trạng thái thất bại.');
    //   }
    // );
  }
}
