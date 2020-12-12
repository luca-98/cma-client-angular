import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { TemplateReportService } from 'src/app/core/service/template-report.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { AddEditGroupDialogComponent } from './add-edit-group-dialog/add-edit-group-dialog.component';

@Component({
  selector: 'app-template-report',
  templateUrl: './template-report.component.html',
  styleUrls: ['./template-report.component.scss']
})
export class TemplateReportComponent implements OnInit {

  listTemplate = [];
  listGroupTemplate = [];
  dataDisplay = [];
  lastEditArray = [];

  userPermissionCode = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private dialog: MatDialog,
    private templateReportService: TemplateReportService,
    private router: Router,
    private credentialsService: CredentialsService,
    private changeDetectorRef: ChangeDetectorRef,
    private menuService: MenuService,
    private route: ActivatedRoute,
  ) {
    this.menuService.reloadMenu.subscribe(() => {
      this.userPermissionCode = this.credentialsService.credentials.permissionCode;
      changeDetectorRef.detectChanges();
    });
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
    this.titleService.setTitle('Quản lý mẫu kết quả dịch vụ');
    this.sideMenuService.changeItem(4.3);
    this.initData();
    this.userPermissionCode = this.credentialsService.credentials.permissionCode;
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

  async initData() {
    await this.getAllTemplateReport();
    await this.getAllGroupTemplateReport();
    this.buildDataDisplay();
  }

  async getAllTemplateReport() {
    await this.templateReportService.getAllTemplateReport()
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.listTemplate = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  async getAllGroupTemplateReport() {
    await this.templateReportService.getAllGroupTemplateReport()
      .toPromise()
      .then(
        (data: any) => {
          if (data.message) {
            this.listGroupTemplate = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải dữ liệu');
        }
      );
  }

  buildDataDisplay() {
    this.dataDisplay = [];
    for (const template of this.listTemplate) {
      if (template.groupId === null) {
        this.dataDisplay.push({
          isShow: true,
          isGroup: false,
          isOpen: false,
          isChildren: false,
          id: template.templateReportId,
          name: template.templateName,
          updatedAt: template.updatedAt,
          parentId: null
        });
      }
    }
    for (const group of this.listGroupTemplate) {
      this.dataDisplay.push({
        isShow: true,
        isGroup: true,
        isOpen: true,
        isChildren: false,
        id: group.id,
        name: group.groupTemplateName,
        updatedAt: group.updatedAt,
        parentId: null
      });
      for (const template of this.listTemplate) {
        if (template.groupId === group.id) {
          this.dataDisplay.push({
            isShow: true,
            isGroup: false,
            isOpen: false,
            isChildren: true,
            id: template.templateReportId,
            name: template.templateName,
            updatedAt: template.updatedAt,
            parentId: template.groupId
          });
        }
      }
    }
  }

  addGroup() {
    const dialogRef = this.dialog.open(AddEditGroupDialogComponent, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      position: { top: '120px' },
      data: { title: 'Thêm nhóm kết quả mới', groupOpenDefault: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.templateReportService.addGroupTemplateReport(result.reportName)
          .subscribe(
            () => {
              const dialogRefNoti = this.dialog.open(NotifyDialogComponent, {
                width: '350px',
                disableClose: true,
                autoFocus: false,
                data: { title: 'Thông báo', content: 'Thêm nhóm kết quả dịch vụ thành công' },
              });

              dialogRefNoti.afterClosed().subscribe(() => {
                this.initData();
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  editItem(id: any) {
    for (const e of this.listGroupTemplate) {
      if (e.id === id) {
        this.editGroupTemplate(id);
        return;
      }
    }
    for (const e of this.listTemplate) {
      if (e.templateReportId === id) {
        this.editTemplate(id);
        return;
      }
    }
  }

  deleteItem(id: any) {
    for (const e of this.listGroupTemplate) {
      if (e.id === id) {
        this.deleteGroupTemplate(id);
        return;
      }
    }
    for (const e of this.listTemplate) {
      if (e.templateReportId === id) {
        this.deleteTemplate(id);
        return;
      }
    }
  }

  editGroupTemplate(id: string) {
    const group = this.listGroupTemplate.find(x => x.id === id);
    const dialogRef = this.dialog.open(AddEditGroupDialogComponent, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      position: { top: '120px' },
      data: { title: 'Sửa nhóm kết quả', reportName: group.groupTemplateName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.templateReportService.editGroupTemplateReport(id, result.reportName)
          .subscribe(
            () => {
              const dialogRefNoti = this.dialog.open(NotifyDialogComponent, {
                width: '350px',
                disableClose: true,
                autoFocus: false,
                data: { title: 'Thông báo', content: 'Sửa nhóm kết quả dịch vụ thành công' },
              });

              dialogRefNoti.afterClosed().subscribe(() => {
                this.initData();
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  deleteGroupTemplate(id: string) {
    for (const template of this.listTemplate) {
      if (template.groupId === id) {
        this.openNotifyDialog('Lỗi', 'Bạn đã chọn nhóm kết quả mà có kết quả ở trong, không thể thực hiện xóa, vui lòng xóa các kết quả bên trong nhóm kết quả và thử lại');
        return;
      }
    }
    const dialogRef = this.openConfirmDialog('Thông báo', ' Bạn có muốn xóa nhóm mẫu kết quả dịch vụ này không, thao tác sẽ không thể hoàn tác');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.templateReportService.deleteGroupTemplateReport(id)
          .subscribe(
            () => {
              const dialogRefNoti = this.dialog.open(NotifyDialogComponent, {
                width: '350px',
                disableClose: true,
                autoFocus: false,
                data: { title: 'Thông báo', content: 'Xóa nhóm mẫu kết quả dịch vụ thành công' },
              });

              dialogRefNoti.afterClosed().subscribe(() => {
                this.initData();
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  editTemplate(id: string) {
    this.router.navigate(['/manage-service/template-report/edit'], { queryParams: { id } });
  }

  deleteTemplate(id: string) {
    const dialogRef = this.openConfirmDialog('Thông báo', ' Bạn có muốn xóa kết quả dịch vụ này không, thao tác sẽ không thể hoàn tác');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.templateReportService.deleteTemplateReport(id)
          .subscribe(
            () => {
              const dialogRefNoti = this.dialog.open(NotifyDialogComponent, {
                width: '350px',
                disableClose: true,
                autoFocus: false,
                data: { title: 'Thông báo', content: 'Xóa mẫu kết quả dịch vụ thành công' },
              });

              dialogRefNoti.afterClosed().subscribe(() => {
                this.initData();
              });
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  groupCollapseClick(id: string, openStatus: any) {
    for (const item of this.dataDisplay) {
      if (item.id === id) {
        item.isOpen = !openStatus;
      }
      if (item.parentId === id) {
        if (openStatus) {
          item.isShow = false;
        } else {
          item.isShow = true;
        }
      }
    }
  }
}
