import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DebtPaymentSlipService } from 'src/app/core/service/debt-payment-slip.service';
import { ManageVoucherService } from 'src/app/core/service/manage-voucher.service';
import { oneDot } from '../../share-func';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-view-debt',
  templateUrl: './view-debt.component.html',
  styleUrls: ['./view-debt.component.scss']
})
export class ViewDebtComponent implements OnInit {
  type: any;
  id: any;
  data = {
    debtPaymentDate: '',
    total: 0,
    paid: 0,
    debt: 0,
    debtPaymentNote: '',
    patient: {
      patientName: '',
      patientCode: '',
    },
    supplier: {
      supplierName: '',
      phone: '',
    },
    staffName: '',
    voucherNumber: ''
  };
  isLoading = false;

  listData = [];
  constructor(
    public dialogRef: MatDialogRef<NotifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataInput: any,
    private manageVoucher: ManageVoucherService
  ) {
    if (dataInput) {
      this.type = dataInput.type;
      this.id = dataInput.id;
      this.getDetail();
    }
  }

  ngOnInit(): void {
  }
  oneDot(item) {
    return oneDot(item);
  }

  getDetail() {
    this.isLoading = true;
    this.manageVoucher.getDetalVoucherById(this.id)
      .subscribe(
        (data: any) => {
          if (data.message) {
            this.listData = [];
            const dataRes = data.message;
            this.data.debtPaymentDate = dataRes.debtPaymentDate;
            this.data.debtPaymentNote = dataRes.debtPaymentNote;
            if (this.type === 3) {
              this.data.patient.patientName = dataRes.patient.patientName;
              this.data.patient.patientCode = dataRes.patient.patientCode;
              for (const iterator of dataRes.lstInvoiceDetailShowDebtAfters) {
                let name = '';
                if (iterator.invoiceDetailAfter.medicineSaleDto.nameMedicineSale) {
                  name = iterator.invoiceDetailAfter.medicineSaleDto.nameMedicineSale;
                }
                if (iterator.invoiceDetailAfter.serviceDto.serviceName) {
                  name = iterator.invoiceDetailAfter.serviceDto.serviceName;
                }
                const temp = {
                  name,
                  total: iterator.amountOld,
                  paid: iterator.amountPaidAfterPaiedBefore,
                  paidAtThis: iterator.amountPaidBeforeTime,
                  debt: iterator.amountOld - iterator.amountPaidAfterPaiedBefore
                };
                this.listData.push(temp);
              }
            }
            if (this.type === 4) {
              this.data.supplier.supplierName = dataRes.supplier.supplierName;
              this.data.supplier.phone = dataRes.supplier.phone;
              for (const iterator of dataRes.lstReceiptShowDebtAfters) {
                const temp = {
                  name: iterator.receiptDto.nameOfReceipt,
                  total: iterator.amountOld,
                  paid: iterator.amountPaidAfterPaiedBefore,
                  paidAtThis: iterator.amountPaidBeforeTime,
                  debt: iterator.amountOld - iterator.amountPaidAfterPaiedBefore
                };
                this.listData.push(temp);
              }
            }
            this.data.staffName = dataRes.staff.fullName;
            this.data.voucherNumber = dataRes.voucherNumber;
            this.caculate();
            this.isLoading = false;
          }
        }, err => {
          this.isLoading = false;
        }
      );
  }

  caculate() {
    this.data.total = 0;
    this.data.paid = 0;
    this.data.debt = 0;
    for (const iterator of this.listData) {
      this.data.total += iterator.total;
      this.data.paid += iterator.paid;
      this.data.debt += iterator.debt;
    }
  }


}
