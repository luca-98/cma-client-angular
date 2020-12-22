import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { RoomService } from 'src/app/core/service/room.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { AddEditDialogComponent } from './add-edit-dialog/add-edit-dialog.component';

@Component({
  selector: 'app-manage-room-service',
  templateUrl: './manage-room-service.component.html',
  styleUrls: ['./manage-room-service.component.scss']
})
export class ManageRoomServiceComponent implements OnInit {

  listRoom = [];

  constructor(
    private sideMenuService: SideMenuService,
    private titleService: Title,
    private dialog: MatDialog,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private credentialsService: CredentialsService,
    private roomService: RoomService
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
    this.titleService.setTitle('Quản lý phòng làm việc');
    this.sideMenuService.changeItem(8.4);
    this.getAllRoomService();
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

  getAllRoomService() {
    this.roomService.getListRoomService()
      .subscribe(
        (data: any) => {
          data.message.sort((a: any, b: any) => (a.roomName > b.roomName) ? 1 : ((b.roomName > a.roomName) ? -1 : 0));
          this.listRoom = data.message;
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  add() {
    const dialogRef = this.dialog.open(AddEditDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        isEdit: false,
        room: null,
        listCurrentRoom: this.listRoom
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.addRoomService(result.roomServiceName)
          .subscribe(
            (data: any) => {
              this.listRoom.push(data.message);
              this.openNotifyDialog('Thông báo', 'Thêm mới phòng làm việc thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  edit(e: any) {
    const dialogRef = this.dialog.open(AddEditDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        isEdit: true,
        room: e,
        listCurrentRoom: this.listRoom
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.updateRoomService(e.id, result.roomServiceName)
          .subscribe(
            (data: any) => {
              e.roomName = data.message.roomName;
              e.updatedAt = data.message.updatedAt;
              this.openNotifyDialog('Thông báo', 'Sửa phòng làm việc thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  deleteRoom(id: any) {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn xóa phòng làm việc này?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.deleteRoomService(id)
          .subscribe(
            () => {
              const index = this.listRoom.findIndex(x => x.id == id);
              this.listRoom.splice(index, 1);
              this.openNotifyDialog('Thông báo', 'Xóa phòng làm việc thành công');
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }
}
