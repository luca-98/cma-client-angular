import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { UserService } from 'src/app/core/service/user.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { DialogAddEditComponent } from './dialog-add-edit/dialog-add-edit.component';
import { DialogChangePasswordComponent } from './dialog-change-password/dialog-change-password.component';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {

  listUser = [];

  constructor(
    private sideMenuService: SideMenuService,
    private titleService: Title,
    private dialog: MatDialog,
    private userService: UserService,
    private staffService: StaffService,
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
    this.titleService.setTitle('Quản lý người dùng');
    this.sideMenuService.changeItem(8.1);
    this.getAllUser();
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

  getAllUser() {
    this.userService.getAllUser()
      .subscribe(
        (data: any) => {
          for (const e of data.message) {
            if (e.status == 1) {
              e.status = true;
            } else {
              e.status = false;
            }
          }
          const index = data.message.findIndex(x => x.userGroupCode == 'ROLE_MANAGER');
          const manager = data.message.find(x => x.userGroupCode == 'ROLE_MANAGER');
          data.message.splice(index, 1);
          this.listUser.push(manager);
          this.listUser = [
            ...this.listUser,
            ...data.message
          ];
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  edit(staff: any) {
    const dialogRef = this.dialog.open(DialogAddEditComponent, {
      width: '650px',
      disableClose: true,
      autoFocus: false,
      data: {
        isEdit: true,
        staff
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const user = {
          staffId: staff.staffId,
          userGroupId: result.formGroup.get('userGroupId').value,
          userName: result.formGroup.get('userName').value,
          fullName: result.formGroup.get('fullName').value,
          email: result.formGroup.get('email').value,
          phone: result.formGroup.get('phone').value,
          address: result.formGroup.get('address').value,
          dateOfBirth: result.formGroup.get('dateOfBirth').value.valueOf(),
        };

        this.userService.updateUser(user)
          .subscribe(
            (data: any) => {
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < this.listUser.length; i++) {
                if (data.message.staffId === this.listUser[i].staffId) {
                  this.listUser[i] = data.message;
                  if (this.listUser[i].status == 1) {
                    this.listUser[i].status = true;
                  } else {
                    this.listUser[i].status = false;
                  }
                }
              }
              this.updateServiceStaff(data.message.staffId, result.groupServiceList);
              this.updateRoom(data.message.staffId, result.roomId);
              this.openNotifyDialog('Thông báo', 'Cập nhật thông tin thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  resetPassword(id: any, fullName: any, userName: any) {
    const dialogRef = this.dialog.open(DialogChangePasswordComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: false,
      position: { top: '70px' },
      data: { fullName, userName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.changePassword(id, result.newPassword)
          .subscribe(
            () => {
              this.openNotifyDialog('Thông báo', 'Thay đổi mật khẩu thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  deleteUser(id: any) {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn xóa người dùng này?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(id)
          .subscribe(
            () => {
              const index = this.listUser.findIndex(x => x.staffId == id);
              this.listUser.splice(index, 1);
              this.openNotifyDialog('Thông báo', 'Xóa người dùng thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  add() {
    const dialogRef = this.dialog.open(DialogAddEditComponent, {
      width: '650px',
      disableClose: true,
      autoFocus: false,
      data: {
        isEdit: false,
        staff: null
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const user = {
          password: result.formGroup.get('password').value,
          userGroupId: result.formGroup.get('userGroupId').value,
          userName: result.formGroup.get('userName').value,
          fullName: result.formGroup.get('fullName').value,
          email: result.formGroup.get('email').value,
          phone: result.formGroup.get('phone').value,
          address: result.formGroup.get('address').value,
          dateOfBirth: result.formGroup.get('dateOfBirth').value.valueOf(),
        };

        this.userService.addUser(user)
          .subscribe(
            (data: any) => {
              if (data.message.status == 1) {
                data.message.status = true;
              } else {
                data.message.status = false;
              }
              this.listUser.push(data.message);
              this.updateServiceStaff(data.message.staffId, result.groupServiceList);
              this.updateRoom(data.message.staffId, result.roomId);
              this.openNotifyDialog('Thông báo', 'Thêm mới tài khoản thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  updateServiceStaff(staffId: any, listGroupService: any) {
    this.staffService.updateGroupServiceStaff(staffId, listGroupService)
      .subscribe(
        () => {
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  updateRoom(staffId: any, roomId: any) {
    if (roomId == -1) {
      roomId = null;
    }
    this.staffService.updateRoomStaff(staffId, roomId)
      .subscribe(
        () => {
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  changeStatusStaff(user: any, event: any) {
    this.userService.changeStatusStaff(user.staffId, event.checked ? 1 : 2)
      .subscribe(
        () => {
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }
}
