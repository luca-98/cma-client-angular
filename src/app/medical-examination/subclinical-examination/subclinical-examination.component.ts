import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { MedicalExaminationService } from 'src/app/core/service/medical-examination.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { SubclinicalReportDialogComponent } from 'src/app/shared/dialogs/subclinical-report-dialog/subclinical-report-dialog.component';
import { buildHighlightString, convertDateToNormal, oneDot, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

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

declare var $: any;

@Component({
  selector: 'app-subclinical-examination',
  templateUrl: './subclinical-examination.component.html',
  styleUrls: ['./subclinical-examination.component.scss', '../share-style.scss']
})
export class SubclinicalExaminationComponent implements OnInit {
  isLoadDone = false;

  patientForm: FormGroup;
  listGroupService = [];
  listService = [];
  listPatientService = [];
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  autoAddress = [];
  selectedGroupServiceCode = '';
  searchGroupServiceName = '';
  timer: any;
  listUserGroupService = [];
  medicalExamId = null;
  medicalExamCode = null;
  paid = false;
  today = moment(new Date());
  listChangeStatus = [];
  patientId = null;

  currentEditServiceId = null;
  currentEditService = null;

  userPermissionCode = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private groupService: GroupServiceService,
    private clinicService: ClinicServiceService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private subclinicalService: SubclinicalService,
    private route: ActivatedRoute,
    private router: Router,
    private medicalExaminationService: MedicalExaminationService,
    private datePipe: DatePipe,
    private credentialsService: CredentialsService,
    private changeDetectorRef: ChangeDetectorRef,
    private menuService: MenuService,
  ) {
    this.route.queryParams.subscribe(params => {
      const isNew = params.isNew;
      if (isNew === 'true' && this.listPatientService.length != 0) {
        return;
      }
      this.medicalExamId = params.medicalExamId;
      if (!this.medicalExamId && this.listPatientService.length != 0) {
        this.resetInput();
      }
      this.currentEditServiceId = params.editId;
      if (this.currentEditServiceId === undefined) {
        this.currentEditServiceId = null;
      }
      if (this.currentEditServiceId === null) {
        this.currentEditService = null;
      }
      if (this.listPatientService.length != 0) {
        const e = this.listPatientService.find(x => x.id === this.currentEditServiceId);
        if (e == null) {
          this.currentEditService = null;
          this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { medicalExamId: this.medicalExamId }
          });
          this.titleService.setTitle('Lập phiếu khám cận lâm sàng');
        } else {
          this.currentEditService = e;
        }
      }
    });
    this.menuService.reloadMenu.subscribe(() => {
      this.userPermissionCode = this.credentialsService.credentials.permissionCode;
      changeDetectorRef.detectChanges();
    });
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

  oneDot(item) {
    return oneDot(item);
  }

  ngOnInit(): void {
    if (this.currentEditServiceId && !this.medicalExamId) {
      this.router.navigate(['.'], {
        relativeTo: this.route,
        queryParams: {}
      });
    }
    this.titleService.setTitle('Lập phiếu khám cận lâm sàng');
    this.sideMenuService.changeItem(1.5);

    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
    }, { validator: phoneValidator });
    this.patientId = null;

    this.patientForm.get('patientCode').disable();

    this.getListGroupService();
    this.userPermissionCode = this.credentialsService.credentials.permissionCode;
  }

  dbClick() {
    this.resetInput();
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

  onPhoneInput() {
    if (this.patientForm.hasError('phoneError')) {
      this.patientForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.patientForm.get('phone').setErrors(null);
    }
  }

  onBlurPatientCode() {
    setTimeout(() => {
      this.commonService.findByPatientCode(this.patientForm.get('patientCode').value.toUpperCase())
        .subscribe(
          (res: any) => {
            if (res.message.id === null) {
              this.resetInput();
            } else {
              const date = moment(new Date(res.message.dateOfBirth));
              res.message = propValToString(res.message);
              this.patientForm.patchValue({
                patientName: res.message.patientName,
                patientCode: res.message.patientCode,
                dateOfBirth: date,
                gender: res.message.gender,
                address: res.message.address,
                phone: res.message.phone
              });
              this.patientId = res.message.id;
              this.getListMedicalExamToday(res.message.patientCode);
            }
          },
          () => {
            console.error('call api failed');
          }
        );
    }, 100);
  }

  generateAutoAddress(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }
      const value = this.patientForm.get('address').value.trim();
      if (value === 0) {
        return;
      }
      this.commonService.searchByAddress(value)
        .subscribe(
          (data: any) => {
            this.autoAddress = data.message;
            this.autoAddress = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d);
              this.autoAddress.push({
                value: d,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  getListGroupService() {
    this.groupService.getAllGroupService()
      .subscribe(
        (data: any) => {
          this.listGroupService = data.message;
          this.groupService.getGroupServiceByStaff()
            .subscribe(
              (data2: any) => {
                data2.message.forEach((element: any) => {
                  const item = this.listGroupService.find(x => x.id === element);
                  if (item) {
                    this.listUserGroupService.push(item);
                  }
                });
                if (data2.message.length > 1) {
                  this.selectedGroupServiceCode = '0';
                  this.appendListService();
                } else {
                  if (this.listUserGroupService.length != 0) {
                    this.selectedGroupServiceCode = this.listUserGroupService[0].groupServiceCode;
                    this.getListService(this.selectedGroupServiceCode);
                  }
                }
                if (!this.medicalExamId) {
                  this.isLoadDone = true;
                }
              }
            );
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách nhóm dịch vụ');
        }
      );
  }

  getListMedicalExamToday(patientCode: any) {
    this.subclinicalService.getListMedicalExamToday(patientCode).subscribe(
      (data: any) => {
        if (data.message[0]) {
          this.medicalExamId = data.message[0].id;
          this.medicalExamCode = data.message[0].medicalExaminationCode;
          this.router.navigate(['/medical-examination/subclinical-examination'], {
            queryParams: {
              medicalExamId: this.medicalExamId
            },
            queryParamsHandling: 'merge'
          });
          this.initInfoSubclinical();
        }
      }, (error) => {
        this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh phiếu cận lâm sàng');

      }
    );
  }

  async appendListService() {
    this.searchGroupServiceName = '';
    this.listService = [];
    for (const e of this.listUserGroupService) {
      await this.appendService(e.groupServiceCode);
    }
    if (this.medicalExamId) {
      this.initInfoSubclinical();
    }
  }

  async appendService(groupServiceCode: any) {
    await this.clinicService.getAllServiceByGroupService(groupServiceCode)
      .toPromise()
      .then(
        (data: any) => {
          this.listService = [
            ...this.listService,
            ...data.message
          ];

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
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  async getListService(groupServiceCode: any) {
    this.searchGroupServiceName = '';
    this.selectedGroupServiceCode = groupServiceCode;
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
          if (this.medicalExamId) {
            this.initInfoSubclinical();
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  findServiceInGroupService() {
    this.selectedGroupServiceCode = '-1';
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.clinicService.findServiceByStaff(this.searchGroupServiceName)
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
            this.openNotifyDialog('Lỗi', 'Lỗi khi tìm kiếm dịch vụ');
          }
        );
    }, 300);
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

  resetInput(event?: any) {
    if (event) {
      event.preventDefault();
    }
    this.autoByName = [];
    this.autoByPatientCode = [];
    this.autoByPhone = [];
    this.autoAddress = [];
    this.listPatientService = [];
    if (this.listUserGroupService.length > 1) {
      this.selectedGroupServiceCode = '0';
      this.appendListService();
    } else {
      this.selectedGroupServiceCode = this.listUserGroupService[0].groupServiceCode;
      this.getListService(this.selectedGroupServiceCode);
    }
    this.searchGroupServiceName = '';
    this.paid = false;
    this.medicalExamId = null;
    this.medicalExamCode = null;
    this.router.navigate(['/medical-examination/subclinical-examination']);
    this.patientForm.reset();
    this.patientForm.patchValue(
      {
        patientName: '',
        patientCode: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phone: ''
      }
    );
    this.patientForm.get('patientCode').disable();
    for (const e of this.listService) {
      e.checked = false;
    }
    this.currentEditService = null;
    this.currentEditServiceId = null;
    this.patientId = null;
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
    this.patientId = event.id;
    this.patientForm.get('patientCode').disable();
    this.listPatientService = [];
    for (const iterator of this.listService) {
      iterator.checked = false;
    }
    this.getListMedicalExamToday(event.patientCode);
  }

  deleteService(id: any, isClickDeleteButton?: any) {
    const indexlistPatientService = this.listPatientService.findIndex(x => x.id === id);
    if (indexlistPatientService !== -1) {
      if (this.listPatientService[indexlistPatientService].status === '3') {
        this.openNotifyDialog('Lỗi', 'Không thể thực hiện thao tác, dịch vụ này đã được đánh dấu hoàn thành');
        return;
      }
      this.listPatientService.splice(indexlistPatientService, 1);
    }
    if (isClickDeleteButton) {
      const index = this.listService.findIndex(x => x.id === id);
      if (index !== -1) {
        this.listService[index].checked = false;
      }
    }
  }

  hanldeSelectPatientService(event: any, item: any) {
    if (event.checked) {
      item.code = this.selectedGroupServiceCode;
      item.note = '';
      item.summary = '';
      item.status = 1;
      this.listPatientService.push(item);
      const boxTable = document.querySelector('.js-auto-scroll');
      setTimeout(() => {
        boxTable.scrollTop = boxTable.scrollHeight;
      }, 600);
    } else {
      this.deleteService(item.id);
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
    this.listPatientService.forEach(element => {
      element.serviceId = element.id;
      if (element.htmlReport === undefined || element.htmlReport === null) {
        element.htmlReport = '';
      }
      if (element.summary === undefined || element.summary === null) {
        element.summary = '';
      }
      if (element.note === undefined || element.note === null) {
        element.note = '';
      }
      const item = {
        staffId: element.doctorSelected,
        serviceId: element.id,
        summary: element.summary,
        note: element.note,
        status: element.status,
        htmlReport: element.htmlReport
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

    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn thực hiện thao tác lưu không?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subclinicalService.updateSubclinical(dataPost).subscribe(
          (data: any) => {
            if (data.message) {
              this.patientForm.patchValue({
                patientCode: data.message.patientCode
              });
              this.patientId = data.message.patientId;
              if (this.listChangeStatus.length !== 0) {
                const listAppoint = data.message.listAppoint;
                for (const iterator of this.listChangeStatus) {
                  const item = listAppoint.find(e => e.serviceId === iterator);
                  if (item) {
                    this.subclinicalService.changeStatus(item.serviceReportId, 3).subscribe(
                      (data2: any) => {
                      }, (err) => {
                      }
                    );
                  }
                }
              }
              for (const ele of this.listPatientService) {
                for (const ele2 of data.message.listAppoint) {
                  if (ele.id === ele2.serviceId) {
                    ele.serviceReportId = ele2.serviceReportId;
                  }
                }
              }
              this.medicalExamId = data.message.medicalExamId;
              this.medicalExamCode = data.message.medicalExaminationCode;
              this.router.navigate(['/medical-examination/subclinical-examination'], {
                queryParams: {
                  medicalExamId: this.medicalExamId
                },
                queryParamsHandling: 'merge'
              });
            }
            this.openNotifyDialog('Thông báo', 'Lưu thông tin phiếu cận lâm sàng thành công');
          },
          (error) => {
            this.openNotifyDialog('Lỗi', 'Lưu thông tin phiếu cận lâm sàng thất bại');
          }
        );
      }
    });
  }

  async saveSilent(itemService: any, preventMoveScreen?: any) {
    const listPatientServiceClone = [];
    this.listPatientService.forEach(element => {
      element.serviceId = element.id;
      if (element.htmlReport === undefined || element.htmlReport === null) {
        element.htmlReport = '';
      }
      if (element.summary === undefined || element.summary === null) {
        element.summary = '';
      }
      if (element.note === undefined || element.note === null) {
        element.note = '';
      }
      const item = {
        staffId: element.doctorSelected,
        serviceId: element.id,
        summary: element.summary,
        note: element.note,
        status: element.status,
        htmlReport: element.htmlReport
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

    await this.subclinicalService.updateSubclinical(dataPost)
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.patientForm.patchValue({
              patientCode: data.message.patientCode
            });
            this.patientId = data.message.patientId;
            if (this.listChangeStatus.length !== 0) {
              const listAppoint = data.message.listAppoint;
              for (const iterator of this.listChangeStatus) {
                const item = listAppoint.find(e => e.serviceId === iterator);
                if (item) {
                  this.subclinicalService.changeStatus(item.serviceReportId, 3).subscribe(
                    (data2: any) => {
                    }, (err) => {
                    }
                  );
                }
              }
            }
            for (const ele of this.listPatientService) {
              for (const ele2 of data.message.listAppoint) {
                if (ele.id === ele2.serviceId) {
                  ele.serviceReportId = ele2.serviceReportId;
                }
              }
            }
            this.medicalExamId = data.message.medicalExamId;
            this.medicalExamCode = data.message.medicalExaminationCode;
            this.router.navigate(['/medical-examination/subclinical-examination'], {
              queryParams: {
                medicalExamId: this.medicalExamId
              },
              queryParamsHandling: 'merge'
            });
          }
          itemService = this.listPatientService.find(x => x.serviceId === itemService.serviceId);
          if (!preventMoveScreen) {
            this.currentEditService = itemService;
          }
        },
        (error) => {
          this.openNotifyDialog('Lỗi', 'Lưu thông tin phiếu cận lâm sàng thất bại');
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
          this.medicalExamCode = data.message.medicalExaminationCode;
          const date = moment(new Date(data.message.dateOfBirth));
          this.patientForm.patchValue({
            patientName: data.message.patientName,
            patientCode: data.message.patientCode,
            dateOfBirth: date,
            gender: data.message.gender.toString(),
            address: data.message.address,
            phone: data.message.phone
          });
          this.patientId = data.message.patientId;
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
          }
          this.listPatientService = data.message.listAppoint;
          this.getStatusPayingSubclinical();
          if (this.currentEditServiceId) {
            const e = this.listPatientService.find(x => x.id === this.currentEditServiceId);
            if (e == null) {
              this.currentEditService = null;
              this.router.navigate(['.'], {
                relativeTo: this.route,
                queryParams: { medicalExamId: this.medicalExamId }
              });
            } else {
              this.currentEditService = e;
            }
          }
          this.isLoadDone = true;
        }
      }, () => {
        this.openNotifyDialog('Lỗi', 'Lấy thông tin phiếu cận lâm sàng thất bại.');
      }
    );
  }

  async makeDone(serviceReportId: any, item: any) {
    if (this.patientForm.get('patientCode').value.trim() === '') {
      this.openNotifyDialog('Thông báo', 'Đây là bệnh nhân mới, vui lòng lưu bệnh nhân trước khi tiếp tục thao tác này');
      return;
    }
    if (this.medicalExamId === null) {
      this.openNotifyDialog('Lỗi', 'Vui lòng bấm lưu trước khi tiếp tục thao tác này');
      return;
    }
    if (serviceReportId === undefined || serviceReportId === null) {
      await this.saveSilent(item, true);
    }
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn kết thúc khám dịch vụ này không?');
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.commonService.updateServiceReportMakeDone(item.serviceReportId, item.note, item.summary, item.htmlReport, '3')
          .subscribe(
            (data: any) => {
              if (data.message) {
                this.openNotifyDialog('Thông báo', 'Kết thúc khám thành công');
                item.status = '3';
                this.listChangeStatus.push(item.id);
                this.medicalExaminationService.getMedicalExam(this.medicalExamId)
                  .subscribe(
                    (data2: any) => {
                      this.medicalExamCode = data2.message.medicalExaminationCode;
                      if (data2.status !== 5 && data2.status !== 6) {
                        this.medicalExaminationService.changeStatus(this.medicalExamId, '4')
                          .subscribe(
                            () => {
                              console.log('change status done');
                            },
                            () => {
                              console.log('change status error');
                            }
                          );
                      }
                    },
                    () => {
                      console.log('change status error');
                    }
                  );
              }
            }, (err) => {
              this.openNotifyDialog('Lỗi', 'Kết thúc khám không thành công');
            }
          );
      }
    });
  }

  async detailReport(item: any) {
    if (this.patientForm.get('patientCode').value.trim() === '') {
      const dialogRef = this.openConfirmDialog('Thông báo', 'Đây là bệnh nhân mới, bạn có muốn lưu bệnh nhân này không?');
      dialogRef.afterClosed().subscribe(async result => {
        if (result) {
          this.saveSilent(item);
        }
      });
    } else {
      if (this.patientForm.get('patientName').value.trim() === '') {
        this.openNotifyDialog('Lỗi', 'Vui lòng điền tên bệnh nhân trước khi tiếp tục');
        return;
      }

      if (this.patientForm.get('phone').value.trim().length !== 10 || !(/^\d+$/.test(this.patientForm.get('phone').value.trim()))) {
        this.openNotifyDialog('Lỗi', 'Vui lòng nhập đúng số điện thoại trước khi tiếp tục');
        return;
      }
      if (convertDateToNormal(this.patientForm.get('dateOfBirth').value) === '') {
        this.openNotifyDialog('Lỗi', 'Vui lòng nhập ngày sinh trước khi tiếp tục');
        return;
      }
      if (this.patientForm.get('address').value.trim() === '') {
        this.openNotifyDialog('Lỗi', 'Vui lòng nhập địa chỉ trước khi tiếp tục');
        return;
      }

      if (item.serviceReportId === undefined || item.serviceReportId === null || item.serviceReportId === '') {
        await this.saveSilent(item);
        return;
      }

      if (this.medicalExamId === null) {
        await this.saveSilent(item);
      } else {
        this.currentEditService = item;
      }
    }
  }

  checkEnableCheckbox(id: any) {
    const e = this.listPatientService.find(x => x.id === id);
    if (e !== null && e !== undefined && e.status == '3') {
      return true;
    } else {
      return false;
    }
  }

  openSavedReport(item: any) {
    this.dialog.open(SubclinicalReportDialogComponent, {
      width: '1000px',
      height: '100%',
      data: {
        id: item.serviceReportId,
        content: item.htmlReport
      },
    });
  }

  print() {
    let patientName = this.patientForm.get('patientName').value.trim();
    let phone = this.patientForm.get('phone').value.trim();
    let dateOfBirth = convertDateToNormal(this.patientForm.get('dateOfBirth').value);
    let gender = this.patientForm.get('gender').value;
    let address = this.patientForm.get('address').value.trim();

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

    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          for (const printT of data.message) {
            if (printT.printCode === 'SUBCLINICAL_REPORT') {
              this.commonService.getOnePrintTemplate(printT.id)
                .subscribe(
                  (data2: any) => {
                    const printTemplateHtml = data2.message.templateHTML;
                    const medicalExaminationCode = this.medicalExamCode;
                    const patientCode = this.patientForm.get('patientCode').value.trim();
                    patientName = this.patientForm.get('patientName').value.trim();
                    gender = this.patientForm.get('gender').value == 0 ? 'Nam' : 'Nữ';
                    phone = this.patientForm.get('phone').value.trim();
                    dateOfBirth = this.datePipe.transform(this.patientForm.get('dateOfBirth').value, 'dd/MM/yyyy');
                    address = this.patientForm.get('address').value.trim();

                    const listTrNode = [];
                    let count = 1;
                    for (const ele of this.listPatientService) {
                      const tr = document.createElement('TR');

                      const td1 = document.createElement('TD');
                      td1.style.borderCollapse = 'collapse';
                      td1.style.border = '1px dotted rgb(0, 0, 0)';
                      td1.style.overflowWrap = 'break-word';
                      td1.style.padding = '0px 6px';
                      td1.innerHTML = '' + count++;
                      tr.appendChild(td1);

                      const td2 = document.createElement('TD');
                      td2.style.borderCollapse = 'collapse';
                      td2.style.border = '1px dotted rgb(0, 0, 0)';
                      td2.style.overflowWrap = 'break-word';
                      td2.style.padding = '0px 6px';
                      td2.innerHTML = ele.serviceName;
                      tr.appendChild(td2);

                      const td3 = document.createElement('TD');
                      td3.style.borderCollapse = 'collapse';
                      td3.style.border = '1px dotted rgb(0, 0, 0)';
                      td3.style.overflowWrap = 'break-word';
                      td3.style.padding = '0px 6px';
                      td3.innerHTML = ele.summary;
                      tr.appendChild(td3);

                      const td4 = document.createElement('TD');
                      td4.style.borderCollapse = 'collapse';
                      td4.style.border = '1px dotted rgb(0, 0, 0)';
                      td4.style.overflowWrap = 'break-word';
                      td4.style.padding = '0px 6px';
                      td4.innerHTML = ele.note;
                      tr.appendChild(td4);

                      listTrNode.push(tr);
                    }

                    const today = new Date();
                    const day = this.datePipe.transform(today, 'dd');
                    const month = this.datePipe.transform(today, 'MM');
                    const year = this.datePipe.transform(today, 'yyyy');
                    const objPrint = {
                      medicalExaminationCode,
                      patientCode,
                      patientName,
                      gender,
                      phone,
                      dateOfBirth,
                      address,
                      data: listTrNode,
                      day,
                      month,
                      year
                    };
                    this.processDataPrint(objPrint, printTemplateHtml);
                  },
                  () => {
                    this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
                  }
                );
              break;
            }
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  processDataPrint(objectPrint: any, htmlTemplate: string) {
    const printDoc = document.implementation.createHTMLDocument('no-title');
    const wrapper = printDoc.createElement('div');
    wrapper.setAttribute('class', 'editor');
    printDoc.body.appendChild(wrapper);
    wrapper.innerHTML = htmlTemplate;

    const keySet = Object.keys(objectPrint);
    for (const key of keySet) {
      if (key === 'data') {
        const tbodyAppoint = printDoc.getElementById('tbody-subclinical-report');
        const data = printDoc.getElementById('data');
        for (const tr of objectPrint.data) {
          tbodyAppoint.insertBefore(tr, data);
        }
        data.remove();
        continue;
      }
      const ele = printDoc.getElementById(key);
      if (ele !== null) {
        ele.innerHTML = objectPrint[key];
      }
    }

    $(wrapper).printThis({ importCSS: false });
  }
}
