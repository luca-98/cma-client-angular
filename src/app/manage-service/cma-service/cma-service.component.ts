import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { AddServiceComponent } from 'src/app/shared/dialogs/add-service/add-service.component';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-cma-service',
  templateUrl: './cma-service.component.html',
  styleUrls: ['./cma-service.component.scss']
})
export class CmaServiceComponent implements OnInit {

  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;
  listGroupService = [];
  autoByNameService = [];
  searchData = {
    selectedGroupServiceId: '0',
    serviceName: ''
  };
  timer;
  listService = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private groupService: GroupServiceService,
    private dialog: MatDialog,
    private clinicServiceService: ClinicServiceService

  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Danh mục dịch vụ');
    this.sideMenuService.changeItem(4.1);
    this.getListGroupService();
    this.getAllServicePagging();
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

  openConfirmDialog(title: string, content: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      disableClose: true,
      autoFocus: false,
      data: {
        title,
        content
      },
    });
  }

  openAddDialog(data?) {
    const dialogRef = this.dialog.open(AddServiceComponent, {
      width: '700px',
      disableClose: true,
      autoFocus: false,
      data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof (result) === 'undefined') {
        setTimeout(() => {
          this.searchAllServicePagging();
        }, 300);
      }
    });
  }

  onPageEvent(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.searchAllServicePagging();
  }

  getListGroupService() {
    this.groupService.getAllGroupService().subscribe(
      (data: any) => {
        if (data.message) {
          this.listGroupService = data.message;
        }
      }, (error) => {
        this.openNotifyDialog('Lỗi', 'Lấy danh sach nhóm dịch vụ thất bại.');
      }
    );
  }

  generateAutoByNameService(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.serviceName.trim();
    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.clinicServiceService.autoSearchNameService(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByNameService = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.serviceName);
              this.autoByNameService.push({
                code: d.id,
                value: d.serviceName,
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

  getAllServicePagging() {
    this.isLoading = true;
    this.clinicServiceService.getAllServicePagging(this.pageSize, this.pageIndex).subscribe(
      (data: any) => {
        this.listService = data.message.serviceTableList;
        this.isLoading = false;
        this.tableBottomLength = data.message.totalRecord;
        this.pageSize = data.message.pageSize;
        this.pageIndex = data.message.pageIndex;
      },
      (err) => {
        this.isLoading = false;
        this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình lấy danh sách dịch vụ');
      }
    );
  }
  searchAllServicePagging() {
    this.isLoading = true;
    const dataSearch = {
      serviceName: this.searchData.serviceName,
      groupServiceId: this.searchData.selectedGroupServiceId === '0' ? '' : this.searchData.selectedGroupServiceId
    };
    this.clinicServiceService.searchAllServicePagging(dataSearch, this.pageSize, this.pageIndex).subscribe(
      (data: any) => {
        this.listService = data.message.serviceTableList;
        this.isLoading = false;
        this.tableBottomLength = data.message.totalRecord;
        this.pageSize = data.message.pageSize;
        this.pageIndex = data.message.pageIndex;

      },
      (err) => {
        this.isLoading = false;
        this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình lấy danh sách dịch vụ');
      }
    );
  }

  editService(item) {
    this.openAddDialog(item);
  }

  deleteService(item) {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn xóa dịch vụ "' + item.serviceName + '" không?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clinicServiceService.deleteService(item.serviceId).subscribe(
          (res: any) => {
            if (res.message) {
              this.openNotifyDialog('Thông báo', 'Xóa dịch vụ "' + item.serviceName + '" thành công.');
              this.searchAllServicePagging();
            } else {
              this.openNotifyDialog('Thông báo', 'Xóa dịch vụ "' + item.serviceName + '" thất bại.');
            }
          },
          (err) => {
            this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình xóa dịch vụ');
          }
        );
      }
    });
  }

  reset() {
    this.searchData = {
      selectedGroupServiceId: '0',
      serviceName: ''
    };
    this.searchAllServicePagging();
  }

}
