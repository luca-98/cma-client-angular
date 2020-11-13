import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { GroupMedicineService } from 'src/app/core/service/group-medicine.service';
import { MedicineService } from 'src/app/core/service/medicine.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { WebsocketService } from 'src/app/core/service/websocket.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.scss']
})
export class PrescriptionsComponent implements OnInit {
  patientForm: FormGroup;
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  autoAddress = [];
  time = new Date();
  today = moment(new Date());
  timer;
  patientCode: any;
  medicalExamId: any;
  listGroupMedicine = [];
  listMedicine = [];
  searchMedicineName = '';
  constructor(
    private titleService: Title,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private groupMedicineService: GroupMedicineService,
    private medicineService: MedicineService

  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Kê đơn thuốc');
    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
    }, { validator: this.phoneValidator });
    this.getPatientInfo(this.route.queryParams._value.patientCode);
    this.getListGroupMedicine();
    this.searchByName('');
    this.medicalExamId = this.route.queryParams._value.medicalExamId;
  }

  getPatientInfo(patientCode) {
    if (patientCode) {
      this.commonService.findByPatientCode(patientCode)
        .subscribe(
          (data: any) => {
            if (data.message.length !== 0) {
              this.autoSelected(data.message);
            }
          },
          () => {
          }
        );
    }
  }

  phoneValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
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
    if (this.patientForm.hasError('phoneError')) {
      this.patientForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.patientForm.get('phone').setErrors(null);
    }
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
      phone: event.phone,
    });
  }

  generateAutoPatientByName(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }

      if (this.patientForm.get('patientName').value.length === 0) {
        return;
      }
      this.commonService.searchByName(removeSignAndLowerCase(this.patientForm.get('patientName').value))
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
      if (this.patientForm.get('phone').value.length === 0) {
        return;
      }
      this.commonService.searchByPhone(this.patientForm.get('phone').value)
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

  resetInput() {
    this.autoByName = [];
    this.autoByPatientCode = [];
    this.autoByPhone = [];
    this.patientForm.reset();
  }

  getListGroupMedicine() {
    this.groupMedicineService.getAllGroupMedicine()
      .subscribe(
        (data: any) => {
          if (data.message.length !== 0) {
            this.listGroupMedicine = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Tải danh sách nhóm thuốc thất bại.');
        }
      );
  }

  getListMedicine(id) {
    if (id === 0) {
      this.searchByName(this.searchMedicineName);
    } else {
      this.medicineService.getAllMedicineByGroupMedicine(id)
        .subscribe(
          (data: any) => {
            if (data.message.length !== 0) {
              this.listMedicine = data.message;
            }
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Tải danh sách thuốc thất bại.');
          }
        );
    }
  }

  searchByName(name) {
    this.medicineService.searchMedicineByName(name)
      .subscribe(
        (data: any) => {
          if (data.message.length !== 0) {
            this.listMedicine = [];
            this.listMedicine = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Tải danh sách thuốc thất bại.');
        }
      );
  }

  findAllMedicine() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.medicineService.searchMedicineByName(this.searchMedicineName)
        .subscribe(
          (data: any) => {
            this.listMedicine = [];
            this.listMedicine = data.message;
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tìm kiếm thuốc.');
          }
        );
    }, 300);
  }


}
