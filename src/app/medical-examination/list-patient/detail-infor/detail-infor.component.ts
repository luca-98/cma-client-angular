import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MedicalExaminationService } from 'src/app/core/service/medical-examination.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { PatientService } from 'src/app/core/service/patient.service';
import { ReceivePatientService } from 'src/app/core/service/receive-patient.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MedicalExamReportDialogComponent } from 'src/app/shared/dialogs/medical-exam-report-dialog/medical-exam-report-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { PrescriptionReportDialogComponent } from 'src/app/shared/dialogs/prescription-report-dialog/prescription-report-dialog.component';
import { SubclinicalReportDialogComponent } from 'src/app/shared/dialogs/subclinical-report-dialog/subclinical-report-dialog.component';
import { convertDateToNormal, oneDot, propValToString } from 'src/app/shared/share-func';

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
  selector: 'app-detail-infor',
  templateUrl: './detail-infor.component.html',
  styleUrls: ['./detail-infor.component.scss', '../../share-style.scss']
})
export class DetailInforComponent implements OnInit {
  patientId = null;
  detailForm: FormGroup;
  today = moment(new Date());
  isEdit = false;
  history = [];
  userPermissionCode = [];

  constructor(
    private title: Title,
    private route: ActivatedRoute,
    private router: Router,
    private receivePatientService: ReceivePatientService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private patientService: PatientService,
    private sideMenuService: SideMenuService,
    private medicalExaminationSerivce: MedicalExaminationService,
    private credentialsService: CredentialsService,
    private menuService: MenuService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.route.queryParams.subscribe(params => {
      this.patientId = params.patientId;
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

  ngOnInit(): void {
    this.sideMenuService.changeItem(1.1);
    this.title.setTitle('Lịch sử khám bệnh');
    this.detailForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      debt: ['0']
    }, { validator: phoneValidator });
    this.detailForm.get('patientName').disable();
    this.detailForm.get('patientCode').disable();
    this.detailForm.get('dateOfBirth').disable();
    this.detailForm.get('gender').disable();
    this.detailForm.get('address').disable();
    this.detailForm.get('phone').disable();
    this.detailForm.get('debt').disable();
    if (this.patientId != null) {
      this.initPatient(this.patientId);
    }
    this.userPermissionCode = this.credentialsService.credentials.permissionCode;
  }

  initPatient(id: any) {
    this.receivePatientService.getById(id)
      .subscribe(
        (data: any) => {
          if (data.message.id != null) {
            const date = moment(new Date(data.message.dateOfBirth));
            data.message = propValToString(data.message);
            this.detailForm.patchValue({
              patientName: data.message.patientName,
              patientCode: data.message.patientCode,
              dateOfBirth: date,
              gender: data.message.gender,
              address: data.message.address,
              phone: data.message.phone,
              debt: oneDot(data.message.debt)
            });
            this.initHistory();
          } else {
            this.router.navigate(['/medical-examination/list-patient']);
          }
        },
        () => {
          this.router.navigate(['/medical-examination/list-patient']);
          console.error('search auto failed');
        }
      );
  }

  initHistory() {
    this.patientService.getHistory(this.patientId)
      .subscribe(
        (data: any) => {
          this.processDataHistory(data.message);
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  processDataHistory(data: any) {
    for (const e of data) {
      const date = moment(new Date(e.createdAt)).format('DD/MM/YYYY');
      let found = false;
      for (const h of this.history) {
        if (h.date === date) {
          h.data.push({
            type: e.type,
            id: e.id,
            code: e.code,
            service: e.service,
            quanity: e.quanity,
            summary: e.summary,
            mainDisease: e.mainDisease,
            extraDisease: e.extraDisease,
            staffName: e.staff.fullName
          });
          found = true;
          break;
        }
      }
      if (!found) {
        this.history.push({
          date,
          data: [{
            type: e.type,
            id: e.id,
            code: e.code,
            service: e.service,
            quanity: e.quanity,
            summary: e.summary,
            mainDisease: e.mainDisease,
            extraDisease: e.extraDisease,
            staffName: e.staff.fullName
          }]
        });
      }
    }
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

  onPhoneInput() {
    if (this.detailForm.hasError('phoneError')) {
      this.detailForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.detailForm.get('phone').setErrors(null);
    }
  }


  back(): void {
    this.router.navigate(['/medical-examination/list-patient']);
  }

  moveToReceive() {
    this.router.navigate(['/medical-examination/receive-patient'], { queryParams: { patientId: this.patientId } });
  }

  onDobChange() {
    const dob = this.detailForm.get('dateOfBirth').value;
    if (dob === null) {
      this.detailForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(dob) && !dob._isAMomentObject) {
      this.detailForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    if (dob.isAfter(this.today)) {
      this.detailForm.patchValue({
        dateOfBirth: this.today
      });
    }
  }

  editInfo() {
    this.isEdit = true;
    this.detailForm.get('patientName').enable();
    this.detailForm.get('patientCode').disable();
    this.detailForm.get('dateOfBirth').enable();
    this.detailForm.get('gender').enable();
    this.detailForm.get('address').enable();
    this.detailForm.get('phone').enable();
    // this.detailForm.get('debt').enable();
  }

  saveInfo() {
    const patientName = this.detailForm.get('patientName').value.trim();
    const phone = this.detailForm.get('phone').value.trim();
    const dateOfBirth = convertDateToNormal(this.detailForm.get('dateOfBirth').value);
    const gender = this.detailForm.get('gender').value;
    const address = this.detailForm.get('address').value.trim();

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
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có sửa đổi thông tin bệnh nhân này?');

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commonService.editPatientInfor(this.patientId, patientName, dateOfBirth, gender, address, phone)
          .subscribe(
            (data: any) => {
              this.openNotifyDialog('Thông báo', 'Cập nhật thông tin bệnh nhân thành công');
              this.isEdit = false;
              this.detailForm.get('patientName').disable();
              this.detailForm.get('patientCode').disable();
              this.detailForm.get('dateOfBirth').disable();
              this.detailForm.get('gender').disable();
              this.detailForm.get('address').disable();
              this.detailForm.get('phone').disable();
              this.detailForm.get('debt').disable();
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi khi cập nhật thông tin bệnh nhân');
            }
          );
      }
    });
  }

  detailReport(id: any, type: any) {
    // type 1: Lâm sàng
    // type 2: Cận lâm sàng
    // type 3: Đơn thuốc
    if (type === 1) {
      this.medicalExaminationSerivce.getMedicalExam(id)
        .subscribe(
          (data: any) => {
            this.dialog.open(MedicalExamReportDialogComponent, {
              width: '825px',
              height: '100%',
              data: {
                id,
                content: data.message.printDataHtml
              },
            });
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
          }
        );
    }
    if (type === 2) {
      this.commonService.getSubClinicaById(id)
        .subscribe(
          (data: any) => {
            this.dialog.open(SubclinicalReportDialogComponent, {
              width: '1000px',
              height: '100%',
              data: {
                id,
                content: data.message.htmlReport
              },
            });
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
          }
        );
    }
    if (type === 3) {
      this.commonService.getPrescriptionsyId(id)
        .subscribe(
          (data: any) => {
            this.dialog.open(PrescriptionReportDialogComponent, {
              width: '825px',
              height: '100%',
              data: {
                id,
                content: data.message.htmlReport
              },
            });
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
          }
        );
    }
  }
}
