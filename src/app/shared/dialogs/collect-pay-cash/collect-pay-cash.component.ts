import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { ManageVoucherService } from 'src/app/core/service/manage-voucher.service';
import { PaymentVoucherService } from 'src/app/core/service/payment-voucher.service';
import { ReceiptVoucherService } from 'src/app/core/service/receipt-voucher.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { convertDateToNormal, propValToString, removeSignAndLowerCase } from '../../share-func';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';
import { getText } from 'number-to-text-vietnamese';

@Component({
  selector: 'app-collect-pay-cash',
  templateUrl: './collect-pay-cash.component.html',
  styleUrls: ['./collect-pay-cash.component.scss']
})
export class CollectPayCashComponent implements OnInit {
  patientForm: FormGroup;
  today = moment(new Date());
  type;
  id: any;
  constructor(
    public dialogRef: MatDialogRef<NotifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private receiptVoucherService: ReceiptVoucherService,
    private manageVoucher: ManageVoucherService,
    private paymentVoucherService: PaymentVoucherService,
  ) {

  }


  ngOnInit(): void {
    this.patientForm = this.formBuilder.group({
      date: this.today,
      amount: [0, [Validators.required]],
      description: ['', [Validators.required]],
      objectReceipt: ['', [Validators.required]],
      objectPayment: ['', [Validators.required]],
      number: '',
      amountText: ''
    });
    this.patientForm.get('number').disable();
    this.patientForm.get('amountText').disable();

    this.type = this.data.type;
    if (this.type === 2) {
      this.titleService.setTitle('Phiếu thu tiền mặt');
      this.sideMenuService.changeItem(5.2);
    } else {
      this.titleService.setTitle('Phiếu chi tiền mặt');
      this.sideMenuService.changeItem(5.3);
    }
    if (this.data.id) {
      this.id = this.data.id;
      this.patientForm.disable();
      this.getDetalVoucherById();
    } else {
      this.getNumberVoucher();
    }
  }

  getDetalVoucherById() {
    this.manageVoucher.getDetalVoucherById(this.id)
      .subscribe(
        (data: any) => {
          if (data.message) {
            const res = data.message;
            const date = moment(new Date(res.receiptVoucherDate ? res.receiptVoucherDate : res.paymentVoucherDate));
            const text = getText(res.receiptVoucherAmount > -1 ?
              res.receiptVoucherAmount : res.paymentVoucherAmount) + ' đồng.';

            this.patientForm.patchValue({
              amountText: text,
              objectReceipt: res.objectReceipt,
              amount: res.receiptVoucherAmount > -1 ? res.receiptVoucherAmount : res.paymentVoucherAmount,
              description: res.receiptVoucherDescription ? res.receiptVoucherDescription : res.paymentVoucherDescription,
              date,
              number: res.voucherNumber,
              objectPayment: res.objectPayment,
            });
          }
        }
      );
  }

  save() {
    this.patientForm.markAllAsTouched();
    const dataPost = {
      date: convertDateToNormal(this.patientForm.get('date').value),
      amount: this.patientForm.get('amount').value,
      description: this.patientForm.get('description').value,
      objectReceipt: this.patientForm.get('objectReceipt').value.trim(),
      objectPayment: this.patientForm.get('objectPayment').value
    };
    if (this.type === 2) {
      if (dataPost.objectReceipt === '') {
        this.openNotifyDialog('Lỗi', 'Tên đối tượng không được để trống');
        return;
      }
    } else {
      if (dataPost.objectPayment === '') {
        this.openNotifyDialog('Lỗi', 'Tên đối tượng không được để trống');
        return;
      }
    }
    if (dataPost.amount < 0) {
      this.openNotifyDialog('Lỗi', 'Số tiền không được nhỏ hơn 0');
      this.patientForm.patchValue({
        amount: 0
      });
      return;
    }
    if (dataPost.description === '') {
      this.openNotifyDialog('Lỗi', 'Diễn giải không được để trống');
      return;
    }

    if (this.type === 2) {
      this.receiptVoucherService.savePaymentVoucher(dataPost).subscribe(
        (data: any) => {
          this.openNotifyDialog('Thông báo', 'Lưu thông tin thành công');
          this.dialogRef.close();
        }, (err) => {
          this.openNotifyDialog('Lỗi', 'Lưu thông tin thất bại');
        }
      );
    } else {
      this.paymentVoucherService.savePaymentVoucher(dataPost).subscribe(
        (data: any) => {
          this.openNotifyDialog('Thông báo', 'Lưu thông tin thành công');
          this.dialogRef.close();
        }, (err) => {
          this.openNotifyDialog('Lỗi', 'Lưu thông tin thất bại');
        }
      );
    }


  }

  updateText() {
    if (!this.patientForm.get('amount').value || this.patientForm.get('amount').value === '') {
      this.patientForm.patchValue({
        amount: 0
      });
    }
    const text = getText(this.patientForm.get('amount').value) + ' đồng.';
    this.patientForm.patchValue({
      amountText: text,
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


  getNumberVoucher() {
    if (this.type === 2) {
      this.receiptVoucherService.getNumberVoucher().subscribe(
        (data: any) => {
          if (data.message) {
            this.patientForm.patchValue({
              number: data.message
            });
          }
        },
        err => {

        }
      );
    } else {
      this.paymentVoucherService.getNumberVoucher().subscribe(
        (data: any) => {
          if (data.message) {
            this.patientForm.patchValue({
              number: data.message
            });
          }
        },
        err => {

        }
      );
    }
  }


}
