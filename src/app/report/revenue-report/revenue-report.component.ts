import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { ReportSumService } from 'src/app/core/service/report-sum.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { convertDateToNormal, oneDot } from 'src/app/shared/share-func';

@Component({
  selector: 'app-revenue-report',
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.scss']
})
export class RevenueReportComponent implements OnInit {

  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;

  today = new Date();
  searchData = {
    startDate: new Date(this.today.getFullYear(), 0, 1),
    endDate: this.today,
    year: '',
    type: '2'
  };
  listYear = [];
  listData = [];
  total = {
    totalReceived: 0,
    totalPaymented: 0,
    totalAmountDebtReceivable: 0,
    totalAmountDebtPayment: 0,
    totalAmountMedicineSale: 0,
    totalAmountService: 0,
    totalAmountReceipt: 0
  };
  listShow = [];
  timer;

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private reportSumService: ReportSumService,
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
    this.titleService.setTitle('Báo cáo doanh thu tổng hợp');
    this.sideMenuService.changeItem(6.1);
    this.getYearReport();
  }
  oneDot(item) {
    return oneDot(item);
  }

  onPageEvent(event) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.buildListDisplay();
  }


  buildListDisplay() {
    this.listShow = [];
    if (this.listData.length < this.pageSize) {
      this.listShow = this.listData;
    } else {
      let count = 0;
      for (let i = this.pageIndex * this.pageSize; i < this.listData.length; i++) {
        if (count < this.pageSize) {
          this.listShow.push(this.listData[i]);
        } else {
          break;
        }
        count++;
      }
    }
  }
  resetPaging() {
    this.tableBottomLength = 0;
    this.pageSize = 25;
    this.pageIndex = 0;
  }

  getYearReport() {
    this.reportSumService.getYearReport().subscribe(
      (res: any) => {
        this.listYear = res.message;
        this.searchData.year = this.listYear[0];
        this.showReportSum();
      }
    );
  }

  showReportSum() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.isLoading = true;
      const data = JSON.parse(JSON.stringify(this.searchData));
      data.endDate = convertDateToNormal(this.searchData.endDate);
      data.startDate = convertDateToNormal(this.searchData.startDate);
      if (data.endDate === null || data.startDate === null) {
        return;
      }
      this.reportSumService.showReportSum(data)
        .subscribe(
          (res: any) => {
            if (res.message) {
              this.listData = res.message;
              this.tableBottomLength = this.listData.length;

              this.total = {
                totalReceived: 0,
                totalPaymented: 0,
                totalAmountDebtReceivable: 0,
                totalAmountDebtPayment: 0,
                totalAmountMedicineSale: 0,
                totalAmountService: 0,
                totalAmountReceipt: 0
              };
              for (const iterator of this.listData) {
                this.total.totalReceived += iterator.reportSumShowDTO.totalReceived;
                this.total.totalPaymented += iterator.reportSumShowDTO.totalPaymented;
                this.total.totalAmountDebtReceivable += iterator.reportSumShowDTO.totalAmountDebtReceivable;
                this.total.totalAmountDebtPayment += iterator.reportSumShowDTO.totalAmountDebtPayment;
                this.total.totalAmountMedicineSale += iterator.reportSumShowDTO.totalAmountMedicineSale;
                this.total.totalAmountService += iterator.reportSumShowDTO.totalAmountService;
                this.total.totalAmountReceipt += iterator.reportSumShowDTO.totalAmountReceipt;
              }
              this.buildListDisplay();
              this.isLoading = false;
            }
          }, (err) => {
            this.isLoading = false;
          }
        );
    }, 200);

  }
}
