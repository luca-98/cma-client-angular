import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { DebtPaymentSlipService } from 'src/app/core/service/debt-payment-slip.service';
import { InvoiceService } from 'src/app/core/service/invoice.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SupplierService } from 'src/app/core/service/supplier.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { convertDateToNormal, oneDot, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-pay-debt',
  templateUrl: './pay-debt.component.html',
  styleUrls: ['./pay-debt.component.scss']
})
export class PayDebtComponent implements OnInit {
  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;

  patientForm: FormGroup;
  today = moment(new Date());
  timer;
  autoBySupplierName = [];
  autoBySupplierPhone = [];
  selectedType = 0;
  numberVoucher: any;
  totalA = 0;
  totalB = 0;
  totalC = 0;
  invoiceDetailDebtList = [];
  searchData = {
    startDate: '',
    endDate: this.today
  };

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private debtPaymentSlipService: DebtPaymentSlipService,
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
    this.titleService.setTitle('Phiếu công nợ phải trả');
    this.sideMenuService.changeItem(5.6);
    this.patientForm = this.formBuilder.group({
      supplierId: '',
      supplierName: '',
      supplierPhone: '',
      date: this.today,
      note: ''
    });
    this.patientForm.get('date').disable();

    this.getNumberVoucher();
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

  resetInput() {
    this.patientForm.patchValue({
      supplierId: '',
      supplierName: '',
      supplierPhone: '',
      date: this.today,
      note: ''
    });
    this.patientForm.get('supplierName').enable();
    this.patientForm.get('note').enable();
    this.patientForm.get('supplierPhone').enable();

    this.totalA = 0;
    this.totalB = 0;
    this.totalC = 0;
    this.autoBySupplierName = [];
    this.autoBySupplierPhone = [];
    this.invoiceDetailDebtList = [];
    this.searchData.startDate = '';
  }

  getNumberVoucher() {
    this.debtPaymentSlipService.getNumberVoucherPay().subscribe(
      (data: any) => {
        if (data.message) {
          this.numberVoucher = data.message;
        }
      }
    );
  }

  autoSelected(event: any) {
    this.resetInput();
    event = propValToString(event);
    this.patientForm.patchValue({
      supplierName: event.supplierName,
      supplierId: event.id,
      supplierPhone: event.phone
    });
    this.patientForm.disable();
    this.patientForm.get('note').enable();
    this.getAllReceiptDebtBySupplierId(event.id);
  }

  generateByName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.patientForm.get('supplierName').value.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.debtPaymentSlipService.searchByNameSupplier(value).subscribe(
        (data: any) => {
          this.autoBySupplierName = data.message;
        }, (error) => {
          console.log('auto failed');
        }
      );
    }, 500);
  }

  generateByPhone(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.patientForm.get('supplierPhone').value.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.debtPaymentSlipService.searchByNamePhone(value).subscribe(
        (data: any) => {
          this.autoBySupplierPhone = data.message;
        }, (error) => {
          console.log('auto failed');
        }
      );
    }, 500);
  }

  save() {
    let totalAmountPaymentDebt = 0;
    const lstReceiptUpdates = [];
    for (const iterator of this.invoiceDetailDebtList) {
      totalAmountPaymentDebt += iterator.todayPay;
      lstReceiptUpdates.push({
        receiptId: iterator.receiptId,
        amountCurrentPaid: iterator.todayPay
      });
    }
    const dataSave = {
      supplierId: this.patientForm.get('supplierId').value,
      date: convertDateToNormal(this.patientForm.get('date').value),
      totalAmountPaymentDebt,
      note: this.patientForm.get('note').value.trim(),
      lstReceiptUpdates
    };
    if (this.patientForm.get('supplierName').value === '') {
      this.openNotifyDialog('Lỗi', 'Tên nhà cung cấp không được để trống.');
      return;
    }
    if (this.patientForm.get('supplierPhone').value === '') {
      this.openNotifyDialog('Lỗi', 'Số điện thoại nhà cung cấp không được để trống.');
      return;
    }
    if (dataSave.supplierId === '') {
      this.openNotifyDialog('Lỗi', 'Bạn phải chọn nhà cung cấp từ gợi ý.');
      return;
    }
    this.debtPaymentSlipService.saveDebtPaymentSlipSupplier(dataSave).subscribe(
      (data: any) => {
        if (data.message) {
          this.openNotifyDialog('Thông báo', 'Lưu thông tin thành công.');
          this.getAllReceiptDebtBySupplierId(dataSave.supplierId);
        }
      }, err => {
        this.openNotifyDialog('Lỗi', 'Lưu thông tin thất bại');
      }
    );
  }


  onPageEvent(event: any) {
    const supplierId = this.patientForm.get('supplierId').value;
    if (supplierId !== '') {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;
      this.getAllReceiptDebtBySupplierId(supplierId);
    }
  }


  onInput(item) {
    if (item.todayPay < 0) {
      item.todayPay = 0;
    }
    if (item.todayPay > (item.totalAmount - item.amountPaid)) {
      item.todayPay = item.totalAmount - item.amountPaid;
    }
    this.caculate();
  }

  caculate() {
    this.totalA = 0;
    this.totalB = 0;
    for (const iterator of this.invoiceDetailDebtList) {
      this.totalA += (iterator.totalAmount - iterator.amountPaid);
      this.totalB += iterator.todayPay;
    }
    this.totalC = this.totalA - this.totalB;
  }

  getAllReceiptDebtBySupplierId(id) {
    this.getNumberVoucher();
    this.isLoading = true;
    this.debtPaymentSlipService.getAllReceiptDebtBySupplierId(id, this.pageIndex, this.pageSize)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
          this.invoiceDetailDebtList = data.message.receiptDebtList;
          for (const iterator of this.invoiceDetailDebtList) {
            iterator.todayPay = iterator.totalAmount - iterator.amountPaid;
          }
          this.caculate();
        }, err => {
          this.isLoading = false;
        }
      );
  }

}
