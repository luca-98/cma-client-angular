import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { InvoiceService } from 'src/app/core/service/invoice.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

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
  lstInvoiceDetails = [];
  lstInvoiceDetailsSelected = [];
  invoiceId;
  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private invoiceService: InvoiceService,

  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Thu tiền dịch vụ');
    this.sideMenuService.changeItem(5.1);
    this.patientForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['0', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
    });
    this.patientForm.get('patientCode').disable();

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
    this.patientForm.reset();
  }

  autoSelected(event: any) {
    this.resetInput();
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      id: event.id,
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone
    });
    this.patientForm.get('address').disable();
    this.patientForm.get('dateOfBirth').disable();
    this.patientForm.get('gender').disable();
    this.getInvoiceByPatientId(event.id);
  }

  getInvoiceByPatientId(patientId) {
    this.invoiceService.getInvoiceByPatientId(patientId)
      .subscribe(
        (data: any) => {
          if (data.message.invoiceId) {
            this.invoiceId = data.message.invoiceId;
            const dataRes = data.message;
            this.total = dataRes.totalAmount;
            this.collected = dataRes.amountPaid;
            this.debt = this.total - this.collected;
            this.lstInvoiceDetails = dataRes.lstInvoiceDetails;
            for (const iterator of this.lstInvoiceDetails) {
              iterator.checked = false;
            }
          } else {
            this.openNotifyDialog('Lỗi', 'Bệnh nhân này không có thông tin thanh toán.');
          }
        }, () => {
          this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình lấy thông tin.');
        }
      );
  }


  save() {
    const dataPost = {
      invoiceId: this.invoiceId,
      lstInvoidDetailsSave: []
    };
    for (const iterator of this.lstInvoiceDetailsSelected) {
      dataPost.lstInvoidDetailsSave.push({
        invoiceDetailId: iterator.invoiceDetailId,
        amountInvoiceDetail: iterator.amount,
        amountPaidInvoiceDetail: iterator.amountPaid
      });
    }
    if (dataPost.lstInvoidDetailsSave.length === 0) {
      this.openNotifyDialog('Thông báo', 'bạn cần phải thu tiền ít nhất 1 dịch vụ!');
      return;
    }
    this.invoiceService.updateInvoice(dataPost).subscribe(
      (data: any) => {
        this.openNotifyDialog('Thông báo', 'Lưu thông tin thu tiền dịch vụ thành công.');
      },
      (error) => {
        this.openNotifyDialog('Lỗi', 'Lưu thông tin thu tiền dịch vụ thất bại.');
      }
    );
  }

  addService(item) {
    item.checked = !item.checked;
    if (item.checked) {
      this.lstInvoiceDetailsSelected.push(item);
    } else {
      const index = this.lstInvoiceDetailsSelected.findIndex(e => e.invoiceDetailId === item.invoiceDetailId);
      if (index !== -1) {
        this.lstInvoiceDetailsSelected.splice(index, 1);
      }
    }
  }

  caculate() {
    let totalPaid = 0;
    for (const iterator of this.lstInvoiceDetailsSelected) {
      totalPaid += iterator.amountPaid;
      this.collected += iterator.amountPaid;
    }
    this.debt = this.total - totalPaid;
  }

  onInput(item) {
    if (item.amountPaid < 0) {
      item.amountPaid = 0;
    }
    if (item.amountPaid > item.amount) {
      item.amountPaid = item.amount;
    }
    this.caculate();
  }


}
