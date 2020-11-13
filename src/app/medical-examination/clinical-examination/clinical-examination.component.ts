import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { CommonService } from 'src/app/core/service/common.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, clearNullOfObject, convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';
import * as moment from 'moment';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MedicalExaminationService } from 'src/app/core/service/medical-examination.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-clinical-examination',
  templateUrl: './clinical-examination.component.html',
  styleUrls: ['./clinical-examination.component.scss', '../share-style.scss']
})
export class ClinicalExaminationComponent implements OnInit {
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  autoAddress = [];
  autoIcd10CodeMain = [];
  autoDiseaseNameMain = [];
  autoIcd10CodeExtra = [];
  autoDiseaseNameExtra = [];
  examForm: FormGroup;
  medicalExamId = null;
  enableFuncBtn = false;

  room = {
    name: '',
    id: ''
  };
  doctor = {
    name: '',
    id: ''
  };

  isCountTime = true;
  today = moment(new Date());

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private credentialsService: CredentialsService,
    private medicalExaminationService: MedicalExaminationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.medicalExamId = params.medicalExamId;
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Lập phiếu khám');
    this.sideMenuService.changeItem(1.3);
    this.room = {
      name: this.credentialsService.credentials.roomName,
      id: this.credentialsService.credentials.roomId
    };
    this.doctor = {
      name: this.credentialsService.credentials.fullName,
      id: this.credentialsService.credentials.staffId
    };
    this.examForm = this.formBuilder.group({
      patientId: [''],
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      createdAt: moment(new Date()),
      clinicalExamPrice: ['0'],
      debt: ['0'],
      room: [this.room.name],
      doctor: [this.doctor.name],
      examinationReason: [''],
      bloodVessel: [''],
      bloodPressure: [''],
      breathing: [''],
      temperature: [''],
      height: [''],
      weight: [''],
      symptom: [''],
      summary: [''],
      mainDiseaseCode: [''],
      mainDisease: [''],
      extraDiseaseCode: [''],
      extraDisease: [''],
      payingStatus: ['0']
    });

    this.getClinicalExaminationPrice();

    setInterval(() => {
      if (this.isCountTime) {
        this.today = moment(new Date());
        this.examForm.patchValue({
          createdAt: moment(new Date())
        });
      }
    }, 1000);

    this.examForm.get('patientCode').disable();
    this.examForm.get('debt').disable();
    this.examForm.get('clinicalExamPrice').disable();
    this.examForm.get('room').disable();
    this.examForm.get('doctor').disable();
    if (this.medicalExamId) {
      this.medicalExaminationService.getMedicalExam(this.medicalExamId)
        .subscribe((data: any) => {
          this.fillData(data);
        }, () => { console.error('call api failed'); });
    }
  }


  onPhoneInput() {
    if (this.examForm.hasError('phoneError')) {
      this.examForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.examForm.get('phone').setErrors(null);
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

  getClinicalExaminationPrice() {
    this.commonService.getClinicalExamination()
      .subscribe(
        (data: any) => {
          this.examForm.patchValue({
            clinicalExamPrice: data.message.price
          });
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  autoSelected(event: any) {
    this.resetInput();
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.examForm.patchValue({
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone,
      debt: event.debt
    });
    this.onBlurPatientCode();
  }

  generateAutoPatientByName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }

    if (this.examForm.get('patientName').value.length === 0) {
      return;
    }
    this.commonService.searchByName(removeSignAndLowerCase(this.examForm.get('patientName').value))
      .subscribe(
        (data: any) => {
          this.autoByName = data.message;
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  generateAutoPatientByPatientCode(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }

    if (this.examForm.get('patientCode').value.length === 0) {
      return;
    }
    this.commonService.searchByPatientCode(this.examForm.get('patientCode').value.toUpperCase())
      .subscribe(
        (data: any) => {
          this.autoByPatientCode = data.message;
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  generateAutoPatientByPhone(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    if (this.examForm.get('phone').value.length === 0) {
      return;
    }
    this.commonService.searchByPhone(this.examForm.get('phone').value)
      .subscribe(
        (data: any) => {
          this.autoByPhone = data.message;
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  generateAutoAddress(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.examForm.get('address').value.trim();
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
  }

  onDobChange() {
    if (this.examForm.get('dateOfBirth').value.isAfter(this.today)) {
      this.examForm.patchValue({
        dateOfBirth: this.today
      });
    }
  }

  doubleClick() {
    this.resetInput();
    this.examForm.get('patientCode').enable();
  }

  resetInput() {
    this.autoByPatientCode = [];
    this.autoByName = [];
    this.autoByPhone = [];
    this.autoAddress = [];
    this.autoIcd10CodeMain = [];
    this.autoDiseaseNameMain = [];
    this.autoIcd10CodeExtra = [];
    this.autoDiseaseNameExtra = [];
    this.medicalExamId = null;
    this.enableFuncBtn = false;
    this.examForm.reset();
    this.room = {
      name: this.credentialsService.credentials.roomName,
      id: this.credentialsService.credentials.roomId
    };
    this.doctor = {
      name: this.credentialsService.credentials.fullName,
      id: this.credentialsService.credentials.staffId
    };
    this.examForm.patchValue({
      patientId: '',
      patientName: '',
      patientCode: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      createdAt: moment(new Date()),
      clinicalExamPrice: '0',
      debt: '0',
      room: this.room.name,
      doctor: this.doctor.name,
      examinationReason: '',
      bloodVessel: '',
      bloodPressure: '',
      breathing: '',
      temperature: '',
      height: '',
      weight: '',
      symptom: '',
      summary: '',
      mainDiseaseCode: '',
      mainDisease: '',
      extraDiseaseCode: '',
      extraDisease: '',
      payingStatus: '0'
    });
    this.getClinicalExaminationPrice();
    this.examForm.get('patientCode').disable();
    this.examForm.get('debt').disable();
    this.examForm.get('clinicalExamPrice').disable();
    this.examForm.get('room').disable();
    this.examForm.get('doctor').disable();
    this.clearQueryParam();
  }

  clearQueryParam() {
    this.router.navigate(
      ['.'],
      { relativeTo: this.route, queryParams: {} }
    );
  }

  onBlurPatientCode() {
    setTimeout(() => {
      this.medicalExaminationService.checkMedicalExamByPatientCode(this.examForm.get('patientCode').value.toUpperCase())
        .subscribe(
          (data: any) => {
            if (data.message.patient == null || data.message.patient.id === null) {
              this.resetInput();
              return;
            }
            this.fillData(data);
          },
          () => {
            console.error('call api failed');
          }
        );
    }, 100);
  }

  // onBlurPhone() {
  //   setTimeout(() => {
  //     this.medicalExaminationService.checkMedicalExamByPhone(this.examForm.get('phone').value.toUpperCase())
  //       .subscribe(
  //         (data: any) => {
  //           if (data.message.patient == null || data.message.patient.id === null) {
  //             return;
  //           }
  //           this.fillData(data);
  //         },
  //         () => {
  //           console.error('call api failed');
  //         }
  //       );
  //   }, 100);
  // }

  fillData(data: any) {
    const date = moment(new Date(data.message.patient.dateOfBirth));
    data.message.patient = propValToString(data.message.patient);
    this.examForm.patchValue({
      patientId: data.message.patient.id,
      patientName: data.message.patient.patientName,
      patientCode: data.message.patient.patientCode,
      dateOfBirth: date,
      gender: data.message.patient.gender,
      address: data.message.patient.address,
      phone: data.message.patient.phone,
      debt: data.message.patient.debt
    });
    if (data.message.id !== null) {
      this.medicalExamId = data.message.id;
      this.room = {
        name: data.message.roomService.roomName,
        id: data.message.roomService.id,
      };
      this.doctor = {
        name: data.message.staff.fullName,
        id: data.message.staff.id
      };

      if (this.doctor.id !== this.credentialsService.credentials.staffId) {
        const dialogRef = this.openConfirmDialog('Thông báo', 'Bệnh nhân này đang được bàn giao cho bác sĩ ' + this.doctor.name + '. Bạn có muốn tiếp tục làm việc với bệnh nhân này?');
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.medicalExaminationService.changeDoctor(data.message.id, this.credentialsService.credentials.staffId)
              .subscribe(() => { },
                () => { console.error('call api failed'); });
            this.doctor = {
              name: this.credentialsService.credentials.fullName,
              id: this.credentialsService.credentials.staffId,
            };
          } else {
            this.resetInput();
            return;
          }
        });
      }

      if (data.message.status === 1) {
        this.medicalExaminationService.changeStatus(data.message.id, '2')
          .subscribe(() => { },
            () => { console.error('call api failed'); });
      }
      this.isCountTime = false;
      this.examForm.patchValue({
        createdAt: moment(new Date(data.message.createdAt))
      });
      data.message = clearNullOfObject(data.message);
      this.examForm.patchValue({
        doctor: this.doctor.name,
        room: this.room.name,
        examinationReason: data.message.examinationReason,
        bloodVessel: data.message.bloodVessel,
        bloodPressure: data.message.bloodPressure,
        breathing: data.message.breathing,
        temperature: data.message.temperature,
        height: data.message.height,
        weight: data.message.weight,
        symptom: data.message.symptom,
        summary: data.message.summary,
        mainDisease: data.message.mainDisease,
        mainDiseaseCode: data.message.mainDiseaseCode,
        extraDisease: data.message.extraDisease,
        extraDiseaseCode: data.message.extraDiseaseCode,
        clinicalExamPrice: data.message.clinicalPrice,
        payingStatus: data.message.payingStatus,
      });
      this.enableFuncBtn = true;
    }
  }

  generateAutoDiseaseByCode(event: any, index: any) {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    let value: any;
    if (index === 1) {
      value = this.examForm.get('mainDiseaseCode').value.trim().toUpperCase();
    } else {
      value = this.examForm.get('extraDiseaseCode').value.trim().toUpperCase();
    }

    this.medicalExaminationService.searchByDiseaseCode(value)
      .subscribe(
        (data: any) => {
          if (index === 1) {
            this.autoIcd10CodeMain = data.message;
          } else {
            this.autoIcd10CodeExtra = data.message;
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  generateAutoDiseaseByName(event: any, index: any) {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    let value: any;
    if (index === 1) {
      value = this.examForm.get('mainDisease').value.trim().toUpperCase();
    } else {
      value = this.examForm.get('extraDisease').value.trim().toUpperCase();
    }

    this.medicalExaminationService.searchByDiseaseName(value)
      .subscribe(
        (data: any) => {
          if (index === 1) {
            this.autoDiseaseNameMain = data.message;
          } else {
            this.autoDiseaseNameExtra = data.message;
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  autoSelectedDisease(event: any, index: any) {
    if (index === 1) {
      this.examForm.patchValue({
        mainDisease: event.diseaseName,
        mainDiseaseCode: event.icd10Code
      });
    } else {
      this.examForm.patchValue({
        extraDisease: event.diseaseName,
        extraDiseaseCode: event.icd10Code
      });
    }
  }

  save(showNoti: boolean) {
    let patientCode = this.examForm.get('patientCode').value.trim();
    if (patientCode.length === 0) {
      patientCode = null;
    }
    const patientName = this.examForm.get('patientName').value.trim();
    const phone = this.examForm.get('phone').value.trim();
    const dateOfBirth = convertDateToNormal(this.examForm.get('dateOfBirth').value);
    const gender = this.examForm.get('gender').value;
    const address = this.examForm.get('address').value.trim();
    const debt = this.examForm.get('debt').value;
    const examinationReason = this.examForm.get('examinationReason').value.trim();
    const bloodVessel = this.examForm.get('bloodVessel').value.trim();
    const bloodPressure = this.examForm.get('bloodPressure').value.trim();
    const breathing = this.examForm.get('breathing').value.trim();
    const temperature = this.examForm.get('temperature').value.trim();
    const height = this.examForm.get('height').value.trim();
    const weight = this.examForm.get('weight').value.trim();
    const symptom = this.examForm.get('symptom').value.trim();
    const summary = this.examForm.get('summary').value.trim();
    const mainDisease = this.examForm.get('mainDisease').value.trim();
    const mainDiseaseCode = this.examForm.get('mainDiseaseCode').value.trim();
    const extraDisease = this.examForm.get('extraDisease').value.trim();
    const extraDiseaseCode = this.examForm.get('extraDiseaseCode').value.trim();

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

    if (!showNoti) {
      this.medicalExaminationService.saveMedicalExam(this.medicalExamId, patientCode, patientName, phone,
        dateOfBirth, gender, address, debt, examinationReason, bloodVessel, bloodPressure, breathing,
        temperature, height, weight, symptom, summary, mainDisease, mainDiseaseCode, extraDisease, extraDiseaseCode)
        .subscribe(
          (data: any) => {
            this.examForm.patchValue({
              patientId: data.message.patient.id,
              patientCode: data.message.patient.patientCode
            });
            this.medicalExamId = data.message.id;
            this.enableFuncBtn = true;
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi lưu phiếu khám');
          }
        );
    } else {
      const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn lưu phiếu khám này?');

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.medicalExaminationService.saveMedicalExam(this.medicalExamId, patientCode, patientName, phone,
            dateOfBirth, gender, address, debt, examinationReason, bloodVessel, bloodPressure, breathing,
            temperature, height, weight, symptom, summary, mainDisease, mainDiseaseCode, extraDisease, extraDiseaseCode)
            .subscribe(
              (data: any) => {
                this.examForm.patchValue({
                  patientId: data.message.patient.id,
                  patientCode: data.message.patient.patientCode
                });
                this.medicalExamId = data.message.id;
                this.enableFuncBtn = true;
                this.openNotifyDialog('Thông báo', 'Lưu phiếu khám thành công');
              },
              () => {
                this.openNotifyDialog('Lỗi', 'Lỗi khi lưu phiếu khám');
              }
            );
        }
      });
    }
  }

  cancelMedicalExam() {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn huỷ phiếu khám này?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.medicalExaminationService.changeStatus(this.medicalExamId, '0')
          .subscribe(
            () => {
              const dialogRef2 = this.openNotifyDialog('Thông báo', 'Hủy phiếu khám thành công');
              dialogRef2.afterClosed().subscribe(() => {
                this.router.navigate(['/medical-examination/manage-clinical-examination']);
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Hủy phiếu khám không thành công');
            }
          );
      }
    });
  }

  medicalExamDone() {
    this.save(false);
    const summary = this.examForm.get('summary').value.trim();
    if (summary === '') {
      this.openNotifyDialog('Lỗi', 'Vui lòng điền kết luận trước khi kết thúc khám');
      return;
    }
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn kết thúc khám?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.medicalExaminationService.changeStatus(this.medicalExamId, '5')
          .subscribe(
            () => {
              const dialogRef2 = this.openNotifyDialog('Thông báo', 'Kết thúc khám thành công');
              dialogRef2.afterClosed().subscribe(() => {
                this.router.navigate(['/medical-examination/manage-clinical-examination']);
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Kết thúc khám không thành công');
            }
          );
      }
    });
  }

  moveToAppoint() {
    this.router.navigate(['/medical-examination/clinical-examination/appoint-subclinical'],
      {
        queryParams: {
          medicalExamId: this.medicalExamId
        }
      }
    );
  }

  moveToPrescriptions() {
    this.router.navigate(['/medical-examination/clinical-examination/prescriptions'],
      {
        queryParams: {
          medicalExamId: this.medicalExamId,
          patientCode: this.examForm.get('patientCode').value.toUpperCase()
        }
      }
    );
  }
}
