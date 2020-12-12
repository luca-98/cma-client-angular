import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { ManageVoucherService } from 'src/app/core/service/manage-voucher.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { SupplierService } from 'src/app/core/service/supplier.service';
import { CollectPayCashComponent } from 'src/app/shared/dialogs/collect-pay-cash/collect-pay-cash.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { ViewDebtComponent } from 'src/app/shared/dialogs/view-debt/view-debt.component';
import { buildHighlightString, convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-manage-revenue-expenditure',
  templateUrl: './manage-revenue-expenditure.component.html',
  styleUrls: ['./manage-revenue-expenditure.component.scss']
})
export class ManageRevenueExpenditureComponent implements OnInit {
  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;

  today = moment(new Date());
  timer;
  autoByPatientCode = [];
  autoByName = [];
  autoObjectSearch = [];

  autoSupplierByName = [];
  listStaff = [];

  searchData = {
    patientNameSearch: '',
    patientCode: '',
    staffNameSearch: '',
    supplierNameSearch: '',
    voucherTypeId: '',
    startDate: '',
    endDate: '',
    objectSearch: ''
  };

  listDataDisplay = [];
  listVoucher = [];
  listVoucherType = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private supplierService: SupplierService,
    private staffService: StaffService,
    private manageVoucherService: ManageVoucherService,
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
    this.titleService.setTitle('Quản lý thu chi');
    this.sideMenuService.changeItem(5.5);
    this.getAllVoucherType();
    this.getListStaff();
    this.getAllVoucher();
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

  generateAutoPatientByName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.patientNameSearch.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.commonService.searchByName(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByName = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientName);
              this.autoByName.push({
                value: d.patientName,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }

  getAutoNameObject(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.objectSearch.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.manageVoucherService.getAutoNameObject(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoObjectSearch = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d);
              this.autoObjectSearch.push({
                value: d,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }



  generateAutoPatientByCode(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.patientCode.trim().toUpperCase();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.commonService.searchByPatientCode(value)
        .subscribe(
          (data: any) => {
            this.autoByPatientCode = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientCode);
              this.autoByPatientCode.push({
                value: d.patientCode,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }

  generateAutoSupplierName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.staffNameSearch.trim().toUpperCase();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.supplierService.searchByName(value)
        .subscribe(
          (data: any) => {
            this.autoByPatientCode = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.supplierName);
              this.autoSupplierByName.push({
                value: d.id,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 500);
  }

  getListStaff() {
    this.staffService.getAllStaff().subscribe(
      (data: any) => {
        this.listStaff = data.message;
      }
    );
  }

  buildListDisplay() {
    this.listDataDisplay = [];
    if (this.listVoucher.length < this.pageSize) {
      this.listDataDisplay = this.listVoucher;
    } else {
      let count = 0;
      for (let i = this.pageIndex * this.pageSize; i < this.listVoucher.length; i++) {
        if (count < this.pageSize) {
          this.listDataDisplay.push(this.listVoucher[i]);
        } else {
          break;
        }
        count++;
      }
    }
  }

  getAllVoucher() {
    this.manageVoucherService.getAllVoucher()
      .subscribe(
        (data: any) => {
          this.listVoucher = data.message;
          this.tableBottomLength = this.listVoucher.length;
          this.buildListDisplay();
        }, err => {
          this.openNotifyDialog('Lỗi', 'Lấy thông tin thất bại');
        }
      );
  }

  search() {
    const dataPost = JSON.parse(JSON.stringify(this.searchData));
    dataPost.startDate = convertDateToNormal(this.searchData.startDate);
    dataPost.endDate = convertDateToNormal(this.searchData.endDate);
    this.manageVoucherService.searchAllVoucher(dataPost).subscribe(
      (data: any) => {
        this.listVoucher = data.message;
        this.tableBottomLength = this.listVoucher.length;
        this.buildListDisplay();
      }, err => {
        this.openNotifyDialog('Lỗi', 'Lấy thông tin thất bại');
      }
    );
  }

  onPageEvent(event) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.buildListDisplay();
  }

  resetInput() {
    this.autoByPatientCode = [];
    this.autoByName = [];
    this.autoObjectSearch = [];
    this.searchData = {
      patientNameSearch: '',
      patientCode: '',
      staffNameSearch: '',
      supplierNameSearch: '',
      voucherTypeId: '',
      startDate: '',
      endDate: '',
      objectSearch: ''
    };
    this.search();
  }

  getAllVoucherType() {
    this.manageVoucherService.getAllVoucherType()
      .subscribe(
        (data: any) => {
          this.listVoucherType = data.message;

        }
      );
  }

  viewInfo(type, id) {
    if (type === 2 || type === 1) {
      this.openCollectPayCashDialog(id, type);
    }
    if (type === 3 || type === 4) {
      this.openViewCollectPayDebt(id, type);
    }
  }

  openViewCollectPayDebt(id, type) {
    const config = {
      width: '900px',
      disableClose: true,
      autoFocus: false,
      data: {
        id,
        type
      }
    };
    const dialogRef = this.dialog.open(ViewDebtComponent, config);
  }


  openCollectPayCashDialog(id, type) {
    const config = {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data: {
        id: null,
        type
      }
    };
    if (id) {
      config.data.id = id;
    }
    const dialogRef = this.dialog.open(CollectPayCashComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle('Quản lý thu chi');
      this.sideMenuService.changeItem(5.5);
      if (result !== '') {
        this.search();
      }
    });
  }
}

