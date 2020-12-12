import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { InvoiceService } from 'src/app/core/service/invoice.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { oneDot, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

declare var $: any;

@Component({
  selector: 'app-collect-service-fee',
  templateUrl: './collect-service-fee.component.html',
  styleUrls: ['./collect-service-fee.component.scss']
})
export class CollectServiceFeeComponent implements OnInit {
  patientForm: FormGroup;
  today = moment(new Date());
  timer;
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  total = 0;
  collected = 0;
  debt = 0;
  amountPaid = 0;
  lstInvoiceDetails = [];
  lstInvoiceDetailsSelected = [];
  invoiceId;
  patientId;

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private router: Router,
    private menuService: MenuService,
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
    this.titleService.setTitle('Thu tiền dịch vụ');
    this.sideMenuService.changeItem(5.1);
    this.patientForm = this.formBuilder.group({
      id: '',
      patientName: ['', [Validators.required]],
      patientCode: ['', [Validators.required]],
      dateOfBirth: [''],
      gender: [''],
      address: [''],
      phone: ['', [Validators.minLength(10)]],
    });
    this.patientForm.get('dateOfBirth').disable();
    this.patientForm.get('gender').disable();
    this.patientForm.get('address').disable();

    this.route.queryParams.subscribe(params => {
      if (params.patientId) {
        this.patientId = params.patientId;
        this.getInvoiceByPatientId(params.patientId);
      }
    });
  }

  oneDot(item) {
    return oneDot(item);
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
      this.patientForm.patchValue({
        patientName: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phone: '',
        id: ''
      });
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }

      if (this.patientForm.get('patientCode').value.length === 0) {
        return;
      }
      this.invoiceService.searchByCode(this.patientForm.get('patientCode').value.toUpperCase())
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
      this.invoiceService.searchByPhone(value)
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
      this.invoiceService.searchByName(removeSignAndLowerCase(value))
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
    this.patientForm.patchValue(
      {
        patientName: '',
        patientCode: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phone: '',
        id: ''
      }
    );
    this.lstInvoiceDetails = [];
    this.lstInvoiceDetailsSelected = [];
    this.invoiceId = null;
    this.total = 0;
    this.collected = 0;
    this.debt = 0;
    this.patientForm.enable();
  }

  autoSelected(event: any) {
    this.resetInput();
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      id: event.id,
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: event.dateOfBirth === null ? '' : date,
      gender: event.gender === null ? '' : event.gender.toString(),
      address: event.address,
      phone: event.phone
    });
    this.patientForm.disable();
    this.getInvoiceByPatientId(event.id);
    this.patientId = event.id;
  }

  getInvoiceByPatientId(patientId) {
    this.lstInvoiceDetailsSelected = [];
    this.lstInvoiceDetails = [];
    this.invoiceService.getInvoiceByPatientId(patientId)
      .subscribe(
        (data: any) => {
          if (data.message.length === 0) {
            this.openNotifyDialog('Lỗi', 'Bệnh nhân này không có thông tin thanh toán trong ngày hôm nay.');
            this.router.navigate([this.router.url], { queryParams: {} });
          } else {
            this.total = 0;
            this.collected = 0;
            this.amountPaid = 0;
            this.debt = 0;
            for (const dataRes of data.message) {
              this.total += dataRes.totalAmount;
              this.collected += dataRes.amountPaid;
              this.amountPaid += dataRes.amountPaid;
              for (const iterator of dataRes.lstInvoiceDetails) {
                iterator.invoiceId = dataRes.invoiceId;
              }
              this.lstInvoiceDetails = this.lstInvoiceDetails.concat(dataRes.lstInvoiceDetails);
              if (this.patientForm.get('id').value === '') {
                const patient = dataRes.patientByPatient;
                const date = moment(new Date(patient.dateOfBirth));
                this.patientForm.patchValue({
                  id: patient.id,
                  patientName: patient.patientName,
                  patientCode: patient.patientCode,
                  dateOfBirth: patient.dateOfBirth === null ? '' : date,
                  gender: patient.gender === null ? '' : patient.gender.toString(),
                  address: patient.address,
                  phone: patient.phone
                });
              }
            }
            for (const iterator of this.lstInvoiceDetails) {
              iterator.checked = false;
            }
            this.debt = this.total - this.collected;
            this.total = oneDot(this.total);
            this.collected = oneDot(this.collected);
            this.debt = oneDot(this.debt);
          }
        }, () => {
          this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình lấy thông tin.');
        }
      );
  }


  save() {
    const dataPost = [];

    for (const iterator of this.lstInvoiceDetailsSelected) {
      let index = dataPost.findIndex(e => e.invoiceId == iterator.invoiceId);
      if (index === -1) {
        dataPost.push({
          invoiceId: iterator.invoiceId,
          lstInvoidDetailsSave: []
        });
        index = dataPost.length - 1;
      }
      dataPost[index].lstInvoidDetailsSave.push({
        invoiceDetailId: iterator.invoiceDetailId,
        amountInvoiceDetail: iterator.amount,
        amountPaidInvoiceDetail: iterator.amountPaid
      });
    }
    if (dataPost.length === 0) {
      this.openNotifyDialog('Thông báo', 'Bạn cần phải thu tiền ít nhất 1 dịch vụ!');
      return;
    }

    this.invoiceService.updateInvoice({ lstInvoidDetailListInvoiceSave: dataPost }).subscribe(
      (data: any) => {
        this.openNotifyDialog('Thông báo', 'Lưu thông tin thu tiền dịch vụ thành công.');
        this.getInvoiceByPatientId(this.patientId);

      },
      (error) => {
        this.openNotifyDialog('Lỗi', 'Lưu thông tin thu tiền dịch vụ thất bại.');
      }
    );
  }

  addService(item) {
    item.checked = !item.checked;
    if (item.checked) {
      const clone = JSON.parse(JSON.stringify(item));
      clone.totalDebt = clone.amount - clone.amountPaid;
      clone.amountPaid = clone.totalDebt;
      this.lstInvoiceDetailsSelected.push(clone);
    } else {
      const index = this.lstInvoiceDetailsSelected.findIndex(e => e.invoiceDetailId === item.invoiceDetailId);
      if (index !== -1) {
        this.lstInvoiceDetailsSelected.splice(index, 1);
      }

    }
    this.caculate();

  }

  caculate() {
    let totalPaid = 0;
    this.collected = this.amountPaid;
    for (const iterator of this.lstInvoiceDetailsSelected) {
      totalPaid += iterator.amountPaid;
      this.collected += iterator.amountPaid;
    }
    const total = this.total.toString().replace(/,/img, '');
    this.debt = oneDot(parseInt(total, 10) - this.collected);
    this.collected = oneDot(this.collected);

  }

  onInput(item) {
    if (item.amountPaid < 0 || item.amountPaid === null) {
      item.amountPaid = 0;
    }
    if (item.amountPaid > item.amount) {
      item.amountPaid = item.amount;
    }
    this.caculate();
  }

  print() {
    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          for (const printT of data.message) {
            if (printT.printCode === 'INVOICE') {
              this.commonService.getOnePrintTemplate(printT.id)
                .subscribe(
                  (data2: any) => {
                    const printTemplateHtml = data2.message.templateHTML;
                    const patientCode = this.patientForm.get('patientCode').value.trim();
                    const patientName = this.patientForm.get('patientName').value.trim();
                    const gender = this.patientForm.get('gender').value == 0 ? 'Nam' : 'Nữ';
                    const phone = this.patientForm.get('phone').value.trim();
                    const dateOfBirth = this.datePipe.transform(this.patientForm.get('dateOfBirth').value, 'dd/MM/yyyy');
                    const address = this.patientForm.get('address').value.trim();

                    const listTrNode = [];
                    let count = 1;
                    let totalAmount = 0;
                    let totalPaid = 0;
                    let totalDebt = 0;
                    for (const ele of this.lstInvoiceDetailsSelected) {
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
                      if (ele.serviceDto.id) {
                        td2.innerHTML = ele.serviceDto.serviceName;
                      } else if (ele.medicineSaleDto.id) {
                        td2.innerHTML = ele.medicineSaleDto.nameMedicineSale;
                      }
                      tr.appendChild(td2);

                      const td3 = document.createElement('TD');
                      td3.style.borderCollapse = 'collapse';
                      td3.style.border = '1px dotted rgb(0, 0, 0)';
                      td3.style.overflowWrap = 'break-word';
                      td3.style.padding = '0px 6px';
                      td3.innerHTML = ele.amount;
                      totalAmount += +ele.amount;
                      tr.appendChild(td3);

                      const td4 = document.createElement('TD');
                      td4.style.borderCollapse = 'collapse';
                      td4.style.border = '1px dotted rgb(0, 0, 0)';
                      td4.style.overflowWrap = 'break-word';
                      td4.style.padding = '0px 6px';
                      td4.innerHTML = ele.amountPaid;
                      totalPaid += +ele.amountPaid;
                      tr.appendChild(td4);

                      const td5 = document.createElement('TD');
                      td5.style.borderCollapse = 'collapse';
                      td5.style.border = '1px dotted rgb(0, 0, 0)';
                      td5.style.overflowWrap = 'break-word';
                      td5.style.padding = '0px 6px';
                      td5.innerHTML = '' + (ele.amount - ele.amountPaid);
                      totalDebt += +(ele.amount - ele.amountPaid);
                      tr.appendChild(td5);

                      listTrNode.push(tr);
                    }

                    const today = new Date();
                    const day = this.datePipe.transform(today, 'dd');
                    const month = this.datePipe.transform(today, 'MM');
                    const year = this.datePipe.transform(today, 'yyyy');
                    const objPrint = {
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
                      totalAmount,
                      totalPaid,
                      totalDebt
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
        const tbodyAppoint = printDoc.getElementById('tbody-invoice');
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
