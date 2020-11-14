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
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.scss']
})

export class PrescriptionsComponent implements OnInit {
  patientForm: FormGroup;
  time = new Date();
  today = moment(new Date());
  timer;
  patientCode: any;
  medicalExamId: any;
  prescriptionId: any;
  listGroupMedicine = [];
  listMedicine = [];
  searchMedicineName = '';
  selectedGroupMedicine = '0';
  listUserMedicine = [];
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
      id: [''],
      note: [''],
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
    }, { validator: this.phoneValidator });
    this.patientForm.get('patientCode').disable();
    this.route.queryParams.subscribe(params => {
      this.patientCode = params.patientCode;
      this.medicalExamId = params.medicalExamId;
    });
    this.getListGroupMedicine();
    this.findAllMedicine();
    this.getPrescriptionByMedicalexamId(this.medicalExamId);
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
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      id: event.id ? event.id : '',
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone,
    });
  }

  resetInput() {
    this.patientForm.reset();
    this.patientForm.patchValue({
      patientCode: this.patientCode
    });
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

  initCheckbox() {
    for (const iterator of this.listMedicine) {
      iterator.checked = false;
      iterator.medicineId = iterator.id;
      delete iterator.id;
    }
    if (this.listUserMedicine.length !== 0) {
      for (const iterator of this.listUserMedicine) {
        const index = this.listMedicine.findIndex(e => e.medicineId === iterator.medicineId);
        if (index !== -1) {
          this.listMedicine[index].checked = true;
        }
      }
    }
  }

  getListMedicine(groupId) {
    if (groupId === 0) {
      this.findAllMedicine();
    } else {
      this.medicineService.getAllMedicineByGroupMedicine(groupId)
        .subscribe(
          (data: any) => {
            if (data.message.length !== 0) {
              this.listMedicine = [];
              this.listMedicine = data.message;
              this.initCheckbox();
            }
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Tải danh sách thuốc thất bại.');
          }
        );
    }
  }

  findAllMedicine() {
    clearTimeout(this.timer);
    this.selectedGroupMedicine = '0';
    this.timer = setTimeout(() => {
      this.medicineService.searchMedicineByName(this.searchMedicineName)
        .subscribe(
          (data: any) => {
            this.listMedicine = [];
            this.listMedicine = data.message;
            this.initCheckbox();
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tìm kiếm thuốc.');
          }
        );
    }, 300);
  }

  getPrescriptionByMedicalexamId(medicalExamId) {
    if (medicalExamId) {
      this.medicineService.getPrescriptionByMedicalexamId(medicalExamId)
        .subscribe(
          (data: any) => {
            if (data.message) {
              this.prescriptionId = data.message.id;
              this.autoSelected(data.message.medicalExaminationByMedicalExaminationId.patient);
              this.patientForm.patchValue({
                note: data.message.note
              });
              for (const iterator of data.message.lstPrescriptionDetailDTO) {
                const dataPush = {
                  id: iterator.id,
                  medicineId: iterator.medicineByMedicineId.id,
                  medicineName: iterator.medicineByMedicineId.medicineName,
                  maxQuantity: iterator.medicineByMedicineId.quantity,
                  unitName: iterator.medicineByMedicineId.unitName,
                  quantity: iterator.quantity,
                  noteDetail: iterator.noteDetail
                };
                this.listUserMedicine.push(dataPush);
              }
            }
          },
          () => {
            this.getPatientInfo(this.patientCode);
          }
        );
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

  deleteMedicine(medicineId, isClickDeleteButton?) {
    let indexListUserMedicine = this.listUserMedicine.findIndex(x => x.medicineId === medicineId);
    const prescriptionDetailId = this.listUserMedicine[indexListUserMedicine].id;
    const hanldeCheckbox = () => {
      if (indexListUserMedicine !== -1) {
        this.listUserMedicine.splice(indexListUserMedicine, 1);
      }
      if (isClickDeleteButton) {
        const index = this.listMedicine.findIndex(x => x.medicineId === medicineId);
        if (index !== -1) {
          this.listMedicine[index].checked = false;
        };
      }
    }
    if (prescriptionDetailId) {
      const dialogRef = this.openConfirmDialog(
        'Thông báo',
        'Thuốc này đã được lưu, bạn có muốn xóa thuốc này khỏi phiếu kê đơn thuốc không?'
      );
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.medicineService.deletePrescription(prescriptionDetailId)
            .subscribe(
              (data: any) => {
                if (data.message) {
                  hanldeCheckbox();
                }
              },
              (error) => {
                console.log(error);
                this.openNotifyDialog('Thông báo', 'Xóa thuốc thất bại.');
              }
            );
        }
        else {
          const index = this.listMedicine.findIndex(x => x.medicineId === medicineId);
          if (index !== -1) {
            this.listMedicine[index].checked = true;
          };
        }
      });
    } else {
      hanldeCheckbox();
    }
  }

  hanldeSelectMedicine({ ...item }, event) {
    if (event.target.childNodes[0].nodeName === 'INPUT') {
      if (!item.checked) {
        item.maxQuantity = item.quantity;
        item.quantity = 1;
        item.noteDetail = '';
        item.id = null;
        this.listUserMedicine.push(item);
        const boxTable = document.querySelector('.box-table .table-content');
        setTimeout(() => {
          boxTable.scrollTop = boxTable.scrollHeight;
        }, 50);
      } else {
        this.deleteMedicine(item.medicineId);
      }
    }

  }

  validateQuantity(item) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (item.quantity < 1) {
        item.quantity = 1;
        this.openNotifyDialog('Thông báo', '"' + item.medicineName + '"' + ' phải được kê tối thiểu là 1 ' + item.unitName + '.');
      }
      // if (item.quantity > item.maxQuantity) {
      //   item.quantity = item.maxQuantity;
      //   this.openNotifyDialog('Thông báo', '"' + item.medicineName + '"' + ' hiện chỉ còn ' + item.maxQuantity + ' ' + item.unitName + ' trong kho thuốc.');
      // }
    }, 500);
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

  convertDateToNormal(d: any): string {
    if (!d) {
      return d;
    }
    const date = d._d.getDate();
    const month = d._d.getMonth() + 1;
    const year = d._d.getFullYear();
    return date + '/' + month + '/' + year;

  }

  saveData() {
    const patient = {
      id: this.patientForm.get('id').value,
      patientName: this.patientForm.get('patientName').value.trim(),
      dateOfBirth: this.convertDateToNormal(this.patientForm.get('dateOfBirth').value),
      gender: this.patientForm.get('gender').value,
      address: this.patientForm.get('address').value.trim(),
      phone: this.patientForm.get('phone').value.trim(),
      patientCode: this.patientForm.get('patientCode').value.trim(),
      note: this.patientForm.get('note').value.trim(),
    };

    if (patient.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }
    if (patient.phone.length !== 10 || !(/^\d+$/.test(patient.phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }

    if (patient.dateOfBirth === '') {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không được để trống');
      return;
    }

    if (patient.gender === '') {
      this.openNotifyDialog('Lỗi', 'Giới tính không được để trống');
      return;
    }

    if (patient.address === '') {
      this.openNotifyDialog('Lỗi', 'Địa chỉ không được để trống');
      return;
    }
    if (!this.onDobChange()) {
      return;
    }
    const list = [];
    for (const iterator of this.listUserMedicine) {
      const item = {
        id: iterator.id,
        medicineId: iterator.medicineId,
        quantity: iterator.quantity,
        noteDetail: iterator.noteDetail,
      };
      list.push(item);
    }

    const dataPost = {
      medicalExamId: this.medicalExamId,
      patientId: patient.id,
      prescriptionId: this.prescriptionId ? this.prescriptionId : null,
      patientName: patient.patientName,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      patientCode: patient.patientCode,
      address: patient.address,
      note: patient.note,
      lstMedicineDetail: list
    };
    this.medicineService.updatePrescription(dataPost)
      .subscribe(
        (data: any) => {
          if (data.message) {
            this.openNotifyDialog('Thông báo', 'Lưu thông tin đơn thuốc thành công.');
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lưu thông tin đơn thuốc thất bại.');
        }
      );
  }

}
