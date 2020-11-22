import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { MedicineSaleService } from 'src/app/core/service/medicine-sale.service';
import { MedicineService } from 'src/app/core/service/medicine.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SupplierService } from 'src/app/core/service/supplier.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-export-medicine',
  templateUrl: './export-medicine.component.html',
  styleUrls: ['./export-medicine.component.scss']
})
export class ExportMedicineComponent implements OnInit {

  listUnitName = ['Hộp', 'Lọ', 'Viên', 'Tuýp', 'Vỉ'];
  listMedicine1 = [];
  listMedicine2 = [];
  patientForm: FormGroup;
  timer;
  autoByPatientCode = [];
  autoByName = [];
  listDonThuoc = [];
  autoByMedicineName = [];
  isLoading = false;
  prescriptionId;
  medicineSaleId = '';
  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private medicineSaleService: MedicineSaleService,
    private medicineService: MedicineService,
    private activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Xuất bán thuốc');
    this.sideMenuService.changeItem(2.3);
    this.patientForm = this.formBuilder.group({
      id: [''],
      patientName: ['', [Validators.required]],
      patientCode: ['', [Validators.required]],
      staffName: [''],
      total: [''],
      totalText: ['']
    });
    this.patientForm.get('staffName').disable();
    this.patientForm.get('total').disable();
    this.patientForm.get('totalText').disable();
    this.activatedRoute.queryParams.subscribe(params => {
      this.medicineSaleId = params.medicineSaleId;
    });
    if (this.medicineSaleId) {
      this.getAllByMedicineSaleId();
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
    this.patientForm.reset();
  }

  autoSelected(event: any) {
    this.resetInput();
    event = propValToString(event);
    this.patientForm.patchValue({
      patientName: event.patientName,
      patientCode: event.patientCode,
      id: event.id
    });
    this.patientForm.get('patientCode').disable();
    this.getListPrescriptionByPatientId(event.id);
  }

  getListPrescriptionByPatientId(id) {
    this.medicineSaleId = '';
    this.medicineSaleService.getListPrescriptionByPatientId(id).subscribe(
      (data: any) => {
        if (data.message.length !== 0) {
          this.listDonThuoc = data.message;
          for (const iterator of this.listDonThuoc) {
            iterator.checked = false;
          }
          this.listDonThuoc[0].checked = true;
          this.prescriptionId = this.listDonThuoc[0].id;
          this.getPrescriptionById(this.listDonThuoc[0].id);

        } else {
          this.openNotifyDialog('Thông báo', 'Bệnh nhân này chưa được kê đơn thuốc.');
        }
      }, (err) => {
        this.openNotifyDialog('Lỗi', 'Lấy thông tin đơn thuốc của bệnh nhân thất bại.');
      }
    );
  }

  getPrescriptionById(id) {
    this.prescriptionId = id;
    this.isLoading = true;
    for (const iterator of this.listDonThuoc) {
      iterator.checked = false;
    }

    this.medicineSaleService.getPrescriptionById(id).subscribe(
      (data: any) => {
        if (data.message.length !== 0) {
          const staff = data.message.staffByStaffId;
          this.patientForm.patchValue({
            staffName: staff.fullName
          });
          this.listMedicine1 = data.message.lstPrescriptionDetailDTO;
          for (const iterator of this.listMedicine1) {
            iterator.medicineId = iterator.medicineByMedicineId.id;
            if (iterator.quantityTaken !== null) {
              iterator.realQuantity = iterator.quantityTaken;
            } else {
              iterator.realQuantity = iterator.quantity;
            }
            iterator.total = iterator.medicineByMedicineId.price * iterator.realQuantity;
          }
          this.listMedicine2 = [];
          this.caculatePrice();
          const index = this.listDonThuoc.findIndex(e => e.id === id);
          if (index !== -1) {
            this.listDonThuoc[index].checked = true;
          }
          this.isLoading = false;
        }
      }, (err) => {
        this.isLoading = false;
        this.openNotifyDialog('Lỗi', 'Lấy thông tin đơn thuốc của bệnh nhân thất bại.');
      }
    );
  }

  selectMedicineName(item, $event) {
    if (typeof (this.medicineSaleId) === 'undefined' || this.medicineSaleId === '') {
      this.getPrescriptionById(item.id);
    }
  }

  validateQuantity(item) {
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => {
        const real = item.realQuantity;
        const max = item.quantity;
        const unitName = item.medicineByMedicineId.unitName;
        if (real > max) {
          item.realQuantity = max;
          this.openNotifyDialog('Cảnh báo',
            'bạn chỉ có thể chọn tối đa ' + max + ' ' + unitName);
        }
        if (real < 0) {
          item.realQuantity = 0;
        }
        item.total = item.realQuantity * item.medicineByMedicineId.price;
        this.caculatePrice();
      }, 300
    );
  }

  validateQuantity2(item) {
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => {
        const real = item.quantity;
        const max = item.maxQuantity;
        const unitName = item.unitName;
        if (real > max) {
          item.quantity = max;
          this.openNotifyDialog('Cảnh báo',
            'bạn chỉ có thể chọn tối đa ' + max +
            ' vì trong kho chỉ còn ' + max + ' ' + unitName);
        }
        if (real < 0) {
          item.quantity = 0;
        }
        item.total = item.quantity * item.price;
        this.caculatePrice();
      }, 300
    );
  }

  caculatePrice() {
    let price1 = 0;
    let price2 = 0;
    for (const iterator of this.listMedicine1) {
      price1 += iterator.total;
    }
    for (const iterator of this.listMedicine2) {
      price2 += iterator.total;
    }
    const totalPrice = price1 + price2;
    this.patientForm.patchValue({
      total: totalPrice,
      totalText: totalPrice
    });
  }

  generateByMedicineName(event: any, text): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = text.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.medicineService.searchMedicineByName(value).subscribe(
        (data: any) => {
          this.autoByMedicineName = data.message;
        }, (error) => {
          console.log('auto failed');
        }
      );
    }, 500);
  }

  addNew() {
    const template = {
      id: '',
      medicineName: '',
      unitName: '',
      quantity: 1,
      price: 0,
      total: 0,
      maxQuantity: 0
    };
    this.listMedicine2.push(template);
  }

  inputMedicine(d, item) {
    item.id = d.id;
    item.medicineName = d.medicineName;
    item.unitName = d.unitName;
    item.price = d.price;
    item.maxQuantity = d.quantity;
    item.total = item.quantity * item.price;
    this.caculatePrice();
  }

  save() {
    const lstMedicineSaleDetials = [];

    for (const iterator of this.listMedicine1) {
      const temp = {
        medicineId: iterator.medicineId,
        medicineSaleDetailId: iterator.medicineSaleDeatilId ? iterator.medicineSaleDeatilId : null,
        quantity: iterator.quantity,
        quantityTaken: iterator.realQuantity,
        amount: iterator.total,
        type: 1,
        noteMedicineSaleDetail: iterator.noteDetail
      };
      lstMedicineSaleDetials.push(temp);
    }
    for (const iterator of this.listMedicine2) {
      const temp = {
        medicineId: iterator.id,
        medicineSaleDetailId: iterator.medicineSaleDeatilId ? iterator.medicineSaleDeatilId : null,
        quantity: iterator.quantity,
        quantityTaken: iterator.quantity,
        amount: iterator.total,
        type: 2,
        noteMedicineSaleDetail: ''
      };
      if (!iterator.id || iterator.id === '') {
        this.openNotifyDialog('Lỗi', 'Tất cả các đơn thuốc không theo đơn phải được chọn từ danh sách thuốc gợi ý.');
        return;
      }
      lstMedicineSaleDetials.push(temp);
    }

    const dataPost = {
      patientId: this.patientForm.get('id').value.trim(),
      patientName: this.patientForm.get('patientName').value.trim(),
      patientCode: this.patientForm.get('patientCode').value.trim(),
      prescriptionId: this.prescriptionId ? this.prescriptionId : null,
      medicineSaleId: this.medicineSaleId ? this.medicineSaleId : null,
      totalAmout: this.patientForm.get('total').value,
      lstMedicineSaleDetials
    };
    if (dataPost.patientId === '') {
      this.openNotifyDialog('Lỗi', 'Id bệnh nhân không được để trống');
      return;
    }
    if (dataPost.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }
    if (dataPost.patientCode === '') {
      this.openNotifyDialog('Lỗi', 'Mã bệnh nhân không được để trống');
      return;
    }
    if (dataPost.prescriptionId === null && lstMedicineSaleDetials.length === 0) {
      this.openNotifyDialog('Lỗi', 'Danh sách thuốc không theo đơn không được để trống.');
      return;
    }
    this.medicineSaleService.saveMedicineSale(dataPost).subscribe(
      (data: any) => {
        if (data.message) {
          this.openNotifyDialog('Thông báo', 'Lưu thông tin thành công.');
        } else {
          this.openNotifyDialog('Lỗi', 'Lưu thông tin thất bại.');
        }
      },
      (err) => {
        this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình lưu thông tin.');
      }
    );
  }

  getAllByMedicineSaleId() {
    this.medicineSaleService.getAllByMedicineSaleId(this.medicineSaleId).subscribe(
      (data: any) => {
        if (data.message.length !== 0) {
          const medicineSaleByMedicineSaleId = data.message[0].medicineSaleByMedicineSaleId;
          this.patientForm.patchValue({
            id: medicineSaleByMedicineSaleId.patientEntity.id,
            patientName: medicineSaleByMedicineSaleId.patientEntity.patientName,
            patientCode: medicineSaleByMedicineSaleId.patientEntity.patientCode,
            staffName: medicineSaleByMedicineSaleId.staffEntity.fullName
          });
          if (medicineSaleByMedicineSaleId.prescriptionEntity.id) {
            this.listDonThuoc.push(medicineSaleByMedicineSaleId.prescriptionEntity);
            for (const iterator of this.listDonThuoc) {
              iterator.checked = false;
            }
            this.listDonThuoc[0].checked = true;
            this.prescriptionId = this.listDonThuoc[0].id;
          }
          this.listMedicine1 = [];
          this.listMedicine2 = [];
          for (const iterator of data.message) {
            if (iterator.type === 1) {
              this.listMedicine1.push(iterator);
            } else {
              const template = {
                medicineSaleDeatilId: iterator.medicineSaleDeatilId,
                id: iterator.medicineByMedicineId.id,
                medicineName: iterator.medicineByMedicineId.medicineName,
                unitName: iterator.medicineByMedicineId.unitName,
                quantity: iterator.quantityTaken,
                price: iterator.medicineByMedicineId.price,
                total: iterator.amount,
                maxQuantity: iterator.medicineByMedicineId.quantity
              };
              this.listMedicine2.push(template);
            }
          }
          for (const iterator2 of this.listMedicine1) {
            iterator2.medicineId = iterator2.medicineByMedicineId.id;
            iterator2.noteDetail = iterator2.noteMedicineSaleDetail;
            if (iterator2.quantityTaken !== null) {
              iterator2.realQuantity = iterator2.quantityTaken;
            } else {
              iterator2.realQuantity = iterator2.quantity;
            }
            iterator2.total = iterator2.medicineByMedicineId.price * iterator2.realQuantity;
          }

          this.caculatePrice();
        }
      }, err => {
        this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình lấy thông tin.');
      }
    );
  }

  deleteMedicine(item) {
    this.listMedicine2.splice(item, 1);
  }
}


