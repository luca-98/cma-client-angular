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
import { buildHighlightString, convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';

const phoneValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
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
};

@Component({
  selector: 'app-appoint-subclinical',
  templateUrl: './appoint-subclinical.component.html',
  styleUrls: ['./appoint-subclinical.component.scss', '../../share-style.scss']
})
export class AppointSubclinicalComponent implements OnInit {

  medicalExamId = null;
  patientForm: FormGroup;
  listGroupService = [];
  listService = [];
  listDoctor = [];
  listRoom = [];

  listServiceSelected = [];
  selectedGroupServiceCode = '0';
  searchGroupServiceName = '';

  checkboxesArray = [];

  today = moment(new Date());

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
    private subclinicalService: SubclinicalService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      this.medicalExamId = params.medicalExamId;
    });
  }

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
    this.patientForm.get('patientCode').disable();
    this.getAllGroupServiceAndService();
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

  getInitInfo() {
    this.subclinicalService.getInitInfoAppoint(this.medicalExamId)
      .subscribe(
        (data: any) => {
          if (data.message.patientCode === null) {
            this.router.navigate(['/medical-examination/clinical-examination']);
          }

          const date = moment(new Date(data.message.dateOfBirth));
          data.message = propValToString(data.message);
          this.patientForm.patchValue({
            patientCode: data.message.patientCode,
            patientName: data.message.patientName,
            dateOfBirth: date,
            gender: data.message.gender,
            address: data.message.address,
            phone: data.message.phone
          });

          const listServiceAppoint = data.message.listAppoint;
          for (const e of listServiceAppoint) {
            for (const s of this.listService) {
              if (e.serviceId === s.id) {
                s.checkBox = true;
              }
            }
            const service = this.listService.find(x => x.id === e.serviceId);
            service.doctorSelected = e.staffId;
            for (const room of this.listRoom) {
              for (const staffId of room.staffIdList) {
                if (staffId === e.staffId) {
                  service.roomSelected = room.id;
                }
              }
            }
            service.status = e.status;
            this.listServiceSelected.push(service);
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải thông tin');
        }
      );
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
          this.getInitInfo();
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
            e.status = '1';
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

  checkDisableService(service: any) {
    const appointService = this.listServiceSelected.find(x => x.id === service.id);
    // tslint:disable-next-line: triple-equals
    if (appointService && appointService.status != 1 && appointService.status != 2) {
      return true;
    }
    return false;
  }

  handleSelectService(event: any, service: any) {
    if (event.checked) {
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

  save() {
    const patientName = this.patientForm.get('patientName').value.trim();
    const phone = this.patientForm.get('phone').value.trim();
    const dateOfBirth = convertDateToNormal(this.patientForm.get('dateOfBirth').value);
    const gender = this.patientForm.get('gender').value;
    const address = this.patientForm.get('address').value.trim();

    if (patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }

    if (phone.length !== 10 || !(/^\d+$/.test(phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }

    if (dateOfBirth === '') {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không được để trống');
      return;
    }

    if (gender === '') {
      this.openNotifyDialog('Lỗi', 'Giới tính không được để trống');
      return;
    }

    if (address === '') {
      this.openNotifyDialog('Lỗi', 'Địa chỉ không được để trống');
      return;
    }

    const listAppoint = [];

    for (const e of this.listServiceSelected) {
      if (e.checkBox) {
        if (e.doctorSelected === '') {
          this.openNotifyDialog('Lỗi', `Dịch vụ '${e.serviceName}' chưa được chỉ định bác sỹ`);
          return;
        }
        if (e.roomSelected === '') {
          this.openNotifyDialog('Lỗi', `Dịch vụ '${e.serviceName}' chưa được chỉ định phòng thực hiện`);
          return;
        }
        listAppoint.push({
          serviceReportId: null,
          serviceId: e.id,
          staffId: e.doctorSelected,
          status: null
        });
      }
    }

    const objSave: any = {
      medicalExamId: this.medicalExamId,
      patientCode: null,
      patientName,
      phone,
      dateOfBirth: null,
      dateOfBirthStr: dateOfBirth,
      gender,
      address,
      listAppoint
    };
    this.subclinicalService.saveAppointSubclinical(objSave)
      .subscribe(
        (data: any) => {
          if (data.message) {
            this.openNotifyDialog('Thông báo', 'Lưu thông tin chỉ định thành công');
          } else {
            this.openNotifyDialog('Lỗi', 'Đã xảy ra lỗi khi lưu');
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Đã xảy ra lỗi khi lưu');
        }
      );
  }

  onDobChange() {
    const dob = this.patientForm.get('dateOfBirth').value;
    if (dob === null) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(dob) && !dob._isAMomentObject) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    if (dob.isAfter(this.today)) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
    }
  }

  onPhoneInput() {
    if (this.patientForm.hasError('phoneError')) {
      this.patientForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.patientForm.get('phone').setErrors(null);
    }
  }
}
