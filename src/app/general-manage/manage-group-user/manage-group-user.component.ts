import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { GroupUserService } from 'src/app/core/service/group-user.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { DialogAddEditComponent } from './dialog-add-edit/dialog-add-edit.component';

@Component({
  selector: 'app-manage-group-user',
  templateUrl: './manage-group-user.component.html',
  styleUrls: ['./manage-group-user.component.scss']
})
export class ManageGroupUserComponent implements OnInit {

  listGroupUser = [];

  constructor(
    private sideMenuService: SideMenuService,
    private titleService: Title,
    private dialog: MatDialog,
    private groupUserService: GroupUserService,
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
    this.titleService.setTitle('Quản lý nhóm người dùng');
    this.sideMenuService.changeItem(8.2);
    this.getListGroupService();
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

  getListGroupService() {
    this.groupUserService.getAllGroupUser()
      .subscribe(
        (data: any) => {
          this.listGroupUser = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  addNew() {
    const dialogRef = this.dialog.open(DialogAddEditComponent, {
      width: '550px',
      disableClose: true,
      autoFocus: false,
      data: {
        isEdit: false,
        groupUser: null,
        listGroupUser: this.listGroupUser,
        itemId: null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupUserService.addNewGroupUser(result.groupUserName, result.result)
          .subscribe(
            (data: any) => {
              this.listGroupUser.push(data.message);
              this.openNotifyDialog('Thông báo', 'Thêm mới nhóm người dùng thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  edit(item: any) {
    const dialogRef = this.dialog.open(DialogAddEditComponent, {
      width: '550px',
      disableClose: true,
      autoFocus: false,
      data: {
        isEdit: true,
        groupUser: item,
        listGroupUser: this.listGroupUser,
        itemId: item.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const dialogRef2 = this.openConfirmDialog('Thông báo', 'Thao tác này có thể làm gián đoạn quá trình làm việc của các tài khoản thuộc nhóm người dùng này, bạn có muốn tiếp tục?');

        dialogRef2.afterClosed().subscribe(result2 => {
          if (result2) {
            this.groupUserService.editGroupUser(item.id, result.groupUserName, result.result)
              .subscribe(
                (data: any) => {
                  item.userGroupName = data.message.userGroupName;
                  item.updatedAt = data.message.updatedAt;
                  this.openNotifyDialog('Thông báo', 'Sửa nhóm người dùng thành công');
                },
                () => {
                  this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
                }
              );
          }
        });
      }
    });
  }

  deleteGroupUser(id: any) {
    this.groupUserService.getListUser(id)
      .subscribe(
        (data: any) => {
          if (data.message.length !== 0) {
            this.openNotifyDialog('Lỗi', 'Bạn đã chọn nhóm người dùng mà có người dùng ở trong, không thể thực hiện xóa');
          } else {
            const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn xóa nhóm người dùng này?');
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.groupUserService.deleteGroupUser(id)
                  .subscribe(
                    () => {
                      const index = this.listGroupUser.findIndex(x => x.id == id);
                      this.listGroupUser.splice(index, 1);
                      this.openNotifyDialog('Thông báo', 'Xóa nhóm người dùng thành công');
                    },
                    () => {
                      this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
                    }
                  );
              }
            });
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }
}
