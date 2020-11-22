import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { MedicineSaleService } from 'src/app/core/service/medicine-sale.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, convertDateToNormal, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-manage-export-medicine',
  templateUrl: './manage-export-medicine.component.html',
  styleUrls: ['./manage-export-medicine.component.scss']
})
export class ManageExportMedicineComponent implements OnInit {

  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;

  autoByPatientCode = [];
  autoByName = [];
  autoByStaff = [];
  medicineSaleList = [];

  today = moment(new Date());
  searchData = {
    patientNameSearch: '',
    patientCode: '',
    staffName: '',
    startDate: '',
    endDate: '',
    pageSize: this.pageSize,
    pageIndex: this.pageIndex
  };
  timer;


  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private medicineSaleService: MedicineSaleService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Quản lí xuất bán thuốc');
    this.sideMenuService.changeItem(2.4);
    this.getAllMedicineSale();
  }

  onPageEvent(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.search();
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
      this.medicineSaleService.autoSearchPatientCode(value)
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
      this.medicineSaleService.searchMedicineByName(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByName = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientName);
              this.autoByName.push({
                code: d.patientCode,
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

  generateAutoStaff(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.staffName.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.medicineSaleService.searchMedicineByStaff(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByStaff = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.fullName);
              this.autoByStaff.push({
                value: d.fullName,
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

  getAllMedicineSale() {
    this.isLoading = true;
    this.medicineSaleService.getAllMedicineSale(this.pageSize, this.pageIndex).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.tableBottomLength = data.message.totalRecord;
        this.medicineSaleList = data.message.medicineSaleList;
        this.pageSize = data.message.pageSize;
        this.pageIndex = data.message.pageIndex;
      },
      (err) => {
        this.isLoading = false;
        this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách xuất bán thuốc thất bại');
      }
    );
  }

  search() {
    this.isLoading = true;
    this.searchData.pageSize = this.pageSize;
    this.searchData.pageIndex = this.pageIndex;
    const dataGet = JSON.parse(JSON.stringify(this.searchData));
    dataGet.endDate = convertDateToNormal(this.searchData.endDate);
    dataGet.startDate = convertDateToNormal(this.searchData.startDate);
    this.medicineSaleService.searchMedicineSale(dataGet).subscribe(
      (data: any) => {
        this.isLoading = false;
        this.tableBottomLength = data.message.totalRecord;
        this.medicineSaleList = data.message.medicineSaleList;
        this.pageSize = data.message.pageSize;
        this.pageIndex = data.message.pageIndex;
      },
      (err) => {
        this.isLoading = false;
        this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách xuất bán thuốc thất bại');
      }
    );
  }

  resetInput() {
    this.searchData = {
      patientNameSearch: '',
      patientCode: '',
      staffName: '',
      startDate: '',
      endDate: '',
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    };
  }

  viewDetail(id) {
    this.router.navigate(['/manage-medicine/export-medicine'], { queryParams: { medicineSaleId: id } });
  }

}
