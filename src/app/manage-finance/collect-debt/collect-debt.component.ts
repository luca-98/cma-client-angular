import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { DebtPaymentSlipService } from 'src/app/core/service/debt-payment-slip.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { PatientService } from 'src/app/core/service/patient.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { SupplierService } from 'src/app/core/service/supplier.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { convertDateToNormal, oneDot, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-collect-debt',
  templateUrl: './collect-debt.component.html',
  styleUrls: ['./collect-debt.component.scss']
})
export class CollectDebtComponent implements OnInit {

  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;

  patientForm: FormGroup;
  today = moment(new Date());
  timer;
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
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
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private patientService: PatientService,
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
    this.titleService.setTitle('Phiếu thu công nợ');
    this.sideMenuService.changeItem(5.4);
    this.patientForm = this.formBuilder.group({
      patientId: '',
      patientName: '',
      patientCode: '',
      date: this.today,
      note: ''
    });
    this.patientForm.get('date').disable();
    this.getNumberVoucher();
    this.route.queryParams.subscribe(params => {
      if (params.patientId) {
        this.patientService.getPatientInfoById(params.patientId).subscribe(
          (data: any) => {
            if (data.message) {
              this.patientForm.patchValue({
                patientId: data.message.id,
                patientName: data.message.patientName,
                patientCode: data.message.patientCode
              });
            }
          },
          err => {
            this.openNotifyDialog('Lỗi', 'Id bệnh nhân không tồn tại.');
            this.router.navigate([this.router.url], { queryParams: {} });
          }
        );
        this.getAllInvoiceDetailDebtByPatientId(params.patientId);
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
        patientId: '',
        patientName: '',
        date: this.today,
        note: ''
      });
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }

      if (this.patientForm.get('patientCode').value.length === 0) {
        return;
      }
      this.debtPaymentSlipService.searchByCode(this.patientForm.get('patientCode').value.toUpperCase())
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
      this.patientForm.patchValue({
        patientId: '',
        date: this.today,
        note: '',
        patientCode: '',
      });
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }
      const value = this.patientForm.get('patientName').value.trim();
      if (value.length === 0) {
        return;
      }
      this.debtPaymentSlipService.searchByName(removeSignAndLowerCase(value))
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
    this.patientForm.patchValue({
      patientId: '',
      patientName: '',
      patientCode: '',
      date: this.today,
      note: ''
    });
    this.totalA = 0;
    this.totalB = 0;
    this.totalC = 0;
    this.invoiceDetailDebtList = [];
    this.searchData.startDate = '';
  }

  getNumberVoucher() {
    this.debtPaymentSlipService.getNumberVoucher().subscribe(
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
      patientId: event.id,
      patientName: event.patientName,
      patientCode: event.patientCode
    });
    this.getAllInvoiceDetailDebtByPatientId(event.id);
  }

  save() {
    let totalAmountPaymentDebt = 0;
    const lstInvoiceDetailUpdateDtos = [];
    for (const iterator of this.invoiceDetailDebtList) {
      totalAmountPaymentDebt += iterator.todayPay;
      lstInvoiceDetailUpdateDtos.push({
        invoiceDetailId: iterator.invoiceDetailId,
        amountCurrentPaid: iterator.todayPay
      });
    }
    const dataSave = {
      patientId: this.patientForm.get('patientId').value,
      patientName: this.patientForm.get('patientName').value.trim(),
      patientCode: this.patientForm.get('patientCode').value.trim(),
      date: convertDateToNormal(this.patientForm.get('date').value),
      totalAmountPaymentDebt,
      note: this.patientForm.get('note').value.trim(),
      lstInvoiceDetailUpdateDtos
    };
    if (dataSave.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống.');
      return;
    }
    if (dataSave.patientCode === '') {
      this.openNotifyDialog('Lỗi', 'Mã bệnh nhân không được để trống.');
      return;
    }
    if (dataSave.patientId === '') {
      this.openNotifyDialog('Lỗi', 'Bạn phải chọn bệnh nhân từ danh sách gợi ý');
      return;
    }
    this.debtPaymentSlipService.saveDebtPaymentSlip(dataSave).subscribe(
      (data: any) => {
        if (data.message) {
          this.openNotifyDialog('Thông báo', 'Lưu thông tin thành công.');
          this.getAllInvoiceDetailDebtByPatientId(dataSave.patientId);
        }
      }, err => {
        this.openNotifyDialog('Lỗi', 'Lưu thông tin thất bại');
      }
    );
  }


  onPageEvent(event: any) {
    if (this.patientForm.get('patientId').value !== '') {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;
      this.search();
    }
  }

  search() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.patientForm.get('patientId').value !== '') {
        this.isLoading = true;
        const dataSearch = {
          startDate: convertDateToNormal(this.searchData.startDate),
          endDate: convertDateToNormal(this.searchData.endDate),
          patientId: this.patientForm.get('patientId').value
        };
        if (!dataSearch.endDate) {
          dataSearch.endDate = convertDateToNormal(this.today);
        }
        if (!dataSearch.startDate) {
          dataSearch.startDate = '';
        }
        this.debtPaymentSlipService.searchAllInvoiceDetailDebt(dataSearch, this.pageSize, this.pageIndex)
          .subscribe(
            (data: any) => {
              this.isLoading = false;
              this.tableBottomLength = data.message.totalRecord;
              this.pageSize = data.message.pageSize;
              this.pageIndex = data.message.pageIndex;
              this.invoiceDetailDebtList = data.message.invoiceDetailDebtList;
              for (const iterator of this.invoiceDetailDebtList) {
                iterator.todayPay = 0;
              }
              this.caculate();
            }, err => {
              this.isLoading = false;
            }
          );
      }
    }, 300);
  }

  onInput(item) {
    if (item.todayPay < 0) {
      item.todayPay = 0;
    }
    if (item.todayPay > (item.amount - item.amountPaid)) {
      item.todayPay = item.amount - item.amountPaid;
    }
    this.caculate();
  }

  caculate() {
    this.totalA = 0;
    this.totalB = 0;
    for (const iterator of this.invoiceDetailDebtList) {
      this.totalA += (iterator.amount - iterator.amountPaid);
      this.totalB += iterator.todayPay;
    }
    this.totalC = this.totalA - this.totalB;
  }

  getAllInvoiceDetailDebtByPatientId(patientId) {
    this.getNumberVoucher();
    this.isLoading = true;
    this.debtPaymentSlipService.getAllInvoiceDetailDebtByPatientId(patientId, this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
          this.invoiceDetailDebtList = data.message.invoiceDetailDebtList;
          for (const iterator of this.invoiceDetailDebtList) {
            iterator.todayPay = 0;
          }
          this.caculate();
        }, err => {
          this.isLoading = false;
        }
      );
  }
}
