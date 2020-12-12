import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { AddGroupServiceComponent } from 'src/app/shared/dialogs/add-group-service/add-group-service.component';
import { AddServiceComponent } from 'src/app/shared/dialogs/add-service/add-service.component';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-cma-group-service',
  templateUrl: './cma-group-service.component.html',
  styleUrls: ['./cma-group-service.component.scss']
})
export class CmaGroupServiceComponent implements OnInit {

  isLoading = false;
  listGroupService = [];
  timer;

  userPermissionCode = [];

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private groupService: GroupServiceService,
    private dialog: MatDialog,
    private clinicServiceService: ClinicServiceService,
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
    this.titleService.setTitle('Danh mục nhóm dịch vụ');
    this.sideMenuService.changeItem(4.2);
    this.getListGroupService();
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

  openAddDialog(data?) {
    const dialogRef = this.dialog.open(AddGroupServiceComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof (result) === 'undefined') {
        setTimeout(() => {
          this.getListGroupService();
        }, 300);
      }
    });
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

  deleteGroupService(item) {
    if (item.groupServiceCode === 'CLINICAL_EXAMINATION') {
      this.openNotifyDialog('Thông báo', 'Bạn không thể xóa nhóm dịch vụ này.');
      return;
    }
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn xóa nhóm dịch vụ "' + item.groupServiceName + '" không?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupService.deleteGroupService(item.id).subscribe(
          (res: any) => {
            if (res.message) {
              this.openNotifyDialog('Thông báo', 'Xóa nhóm dịch vụ "' + item.groupServiceName + '" thành công.');
              this.getListGroupService();
            } else {
              this.openNotifyDialog('Thông báo', 'Xóa nhóm dịch vụ "' + item.groupServiceName + '" thất bại.');
            }
          },
          (err) => {
            this.openNotifyDialog('Lỗi', 'Lỗi trong quá trình xóa nhóm dịch vụ');
          }
        );
      }
    });
  }

}
