import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { MedicineSaleService } from 'src/app/core/service/medicine-sale.service';
import { MedicineService } from 'src/app/core/service/medicine.service';
import { PatientService } from 'src/app/core/service/patient.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SupplierService } from 'src/app/core/service/supplier.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { convertDateToNormal, oneDot, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';
import { getText } from 'number-to-text-vietnamese';
import { InvoiceService } from 'src/app/core/service/invoice.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';

declare var $: any;

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
  medicineSaleId;
  isDisabled = true;
  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private medicineSaleService: MedicineSaleService,
    private medicineService: MedicineService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private patientService: PatientService,
    private invoiceService: InvoiceService,
    private router: Router,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private credentialsService: CredentialsService,
  ) {
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
      this.isDisabled = true;
      this.getAllByMedicineSaleId();
    }
  }

  oneDot(item) {
    return oneDot(item);
  }

  navigateConlectServiceFree() {
    this.router.navigate(['/manage-finance/collect-service-fee'], {
      queryParams:
        { patientId: this.patientForm.get('id').value }, replaceUrl: true
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
    this.listMedicine1 = [];
    this.listMedicine2 = [];
    this.listDonThuoc = [];
    this.prescriptionId = [];
    this.medicineSaleId = '';
    this.prescriptionId = '';
    this.patientForm.patchValue(
      {
        id: '',
        patientName: '',
        patientCode: '',
        staffName: '',
        total: '',
        totalText: ''
      }
    );
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

  selectMedicineName(item, event) {

    if (typeof (this.medicineSaleId) === 'undefined' || this.medicineSaleId === '') {
      if (!item.checked) {
        this.getPrescriptionById(item.id);
      } else {
        this.listMedicine1 = [];
        this.listMedicine2 = [];
        if (!event) {
          item.checked = false;
        }
      }
    } else {
      if (event) {
        item.checked = false;
      } else {
        item.checked = true;
      }
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
            'Bạn chỉ có thể chọn tối đa ' + max + ' ' + unitName);
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
            'Bạn chỉ có thể chọn tối đa ' + max +
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
    let text = getText(totalPrice) + ' đồng.';
    text = text[0].toUpperCase() + text.slice(1);
    this.patientForm.patchValue({
      total: oneDot(totalPrice),
      totalText: text
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
      if (iterator.quantity <= 0) {
        this.openNotifyDialog('Lỗi', 'Tất cả các đơn thuốc không theo đơn phải có số lượng lớn hơn 0.');
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
      totalAmout: parseInt(this.patientForm.get('total').value.replace(/,/gmi, ''), 10),
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
          this.isDisabled = false;
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
          this.invoiceService.getInvoiceByPatientId(medicineSaleByMedicineSaleId.patientEntity.id)
            .subscribe(
              (data2: any) => {
                if (data2.message.length === 0) {
                  this.isDisabled = true;
                } else {
                  this.isDisabled = false;
                }
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
          if (this.listDonThuoc.length !== 0 && this.listMedicine1.length === 0) {
            this.listDonThuoc[0].checked = false;
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
    this.caculatePrice();
  }

  print() {
    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          for (const printT of data.message) {
            if (printT.printCode === 'EXPORT_MEDICINE') {
              this.commonService.getOnePrintTemplate(printT.id)
                .subscribe(
                  (data2: any) => {
                    const printTemplateHtml = data2.message.templateHTML;
                    // const medicalExaminationCode = this.medicalExamCode;

                    this.patientService.getPatientInfoById(this.patientForm.get('id').value)
                      .subscribe(
                        (data3: any) => {
                          const patientCode = data3.message.patientCode;
                          const patientName = data3.message.patientName;
                          const gender = data3.message.gender == 0 ? 'Nam' : 'Nữ';
                          const phone = data3.message.phone;
                          const dateOfBirth = this.datePipe.transform(data3.message.dateOfBirth, 'dd/MM/yyyy');
                          const address = data3.message.address;

                          const listTrNode = [];
                          let count = 1;
                          let totalAmount = 0;
                          for (const ele of this.listMedicine1) {
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
                            td2.innerHTML = ele.medicineByMedicineId.medicineName;
                            tr.appendChild(td2);

                            const td3 = document.createElement('TD');
                            td3.style.borderCollapse = 'collapse';
                            td3.style.border = '1px dotted rgb(0, 0, 0)';
                            td3.style.overflowWrap = 'break-word';
                            td3.style.padding = '0px 6px';
                            td3.innerHTML = ele.realQuantity;
                            tr.appendChild(td3);

                            const td4 = document.createElement('TD');
                            td4.style.borderCollapse = 'collapse';
                            td4.style.border = '1px dotted rgb(0, 0, 0)';
                            td4.style.overflowWrap = 'break-word';
                            td4.style.padding = '0px 6px';
                            td4.innerHTML = ele.medicineByMedicineId.price;
                            tr.appendChild(td4);

                            const td5 = document.createElement('TD');
                            td5.style.borderCollapse = 'collapse';
                            td5.style.border = '1px dotted rgb(0, 0, 0)';
                            td5.style.overflowWrap = 'break-word';
                            td5.style.padding = '0px 6px';
                            td5.innerHTML = ele.total;
                            totalAmount += ele.total;
                            tr.appendChild(td5);

                            listTrNode.push(tr);
                          }

                          for (const ele of this.listMedicine2) {
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
                            td2.innerHTML = ele.medicineName;
                            tr.appendChild(td2);

                            const td3 = document.createElement('TD');
                            td3.style.borderCollapse = 'collapse';
                            td3.style.border = '1px dotted rgb(0, 0, 0)';
                            td3.style.overflowWrap = 'break-word';
                            td3.style.padding = '0px 6px';
                            td3.innerHTML = ele.quantity;
                            tr.appendChild(td3);

                            const td4 = document.createElement('TD');
                            td4.style.borderCollapse = 'collapse';
                            td4.style.border = '1px dotted rgb(0, 0, 0)';
                            td4.style.overflowWrap = 'break-word';
                            td4.style.padding = '0px 6px';
                            td4.innerHTML = ele.price;
                            tr.appendChild(td4);

                            const td5 = document.createElement('TD');
                            td5.style.borderCollapse = 'collapse';
                            td5.style.border = '1px dotted rgb(0, 0, 0)';
                            td5.style.overflowWrap = 'break-word';
                            td5.style.padding = '0px 6px';
                            td5.innerHTML = ele.total;
                            totalAmount += ele.total;
                            tr.appendChild(td5);

                            listTrNode.push(tr);
                          }

                          const today = new Date();
                          const day = this.datePipe.transform(today, 'dd');
                          const month = this.datePipe.transform(today, 'MM');
                          const year = this.datePipe.transform(today, 'yyyy');
                          const objPrint = {
                            // medicalExaminationCode,
                            patientCode,
                            patientName,
                            gender,
                            phone,
                            dateOfBirth,
                            address,
                            data: listTrNode,
                            day,
                            month,
                            year,
                            totalAmount
                          };
                          this.processDataPrint(objPrint, printTemplateHtml);
                        },
                        () => {
                          this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
                        }
                      );
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
        const tbodyAppoint = printDoc.getElementById('tbody-export-medicine');
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


