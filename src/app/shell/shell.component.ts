import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/service/authentication.service';
import { CommonService } from '../core/service/common.service';
import { CredentialsService } from '../core/service/credentials.service';
import { LoaderService } from '../core/service/loader.service';
import { SidebarItem } from '../enum/sidebar-item.enum';
import { NotifyDialogComponent } from '../shared/dialogs/notify-dialog/notify-dialog.component';
import { DialogChangeRoomComponent } from './dialog-change-room/dialog-change-room.component';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  currentUserFullName: string;
  currentRoomName: string;
  showLoader = false;
  sidebarItem = SidebarItem;
  sidebarRightState: SidebarItem = SidebarItem.MedicalExamination;

  constructor(
    private authenticationService: AuthenticationService,
    private loaderService: LoaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private credentialsService: CredentialsService,
    private dialog: MatDialog,
    private commonService: CommonService
  ) {
    this.loaderService.loaderSubject.subscribe((value: boolean) => {
      this.showLoader = value;
      changeDetectorRef.detectChanges();
    });
  }

  ngOnInit(): void {
    this.getInfoShell();
  }

  getInfoShell() {
    this.currentUserFullName = this.credentialsService.credentials.fullName;
    this.currentRoomName = this.credentialsService.credentials.roomName;
  }

  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

  changeSidebarRightState(stateItem: SidebarItem): void {
    this.sidebarRightState = stateItem;
  }

  changeRoom() {
    this.commonService.getServiceThatStaffCanDo()
      .subscribe(
        (data: any) => {
          const dialogRef = this.dialog.open(DialogChangeRoomComponent, {
            width: '450px',
            disableClose: true,
            autoFocus: true,
            data: {
              roomService: data.message,
              currentRoomId: this.credentialsService.credentials.roomId
            },
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.commonService.checkCanChangeRoom()
                .subscribe(
                  (r: any) => {
                    if (r.message) {
                      this.commonService.updateRoomServiceStaff(result.room.id)
                        .subscribe(
                          () => {
                            const credentials = this.credentialsService.credentials;
                            credentials.roomId = result.room.id;
                            credentials.roomName = result.room.roomName;
                            this.credentialsService.updateCredentials(credentials);
                            this.getInfoShell();
                            this.dialog.open(NotifyDialogComponent, {
                              width: '350px',
                              disableClose: true,
                              autoFocus: false,
                              data: {
                                tile: 'Thông báo',
                                content: 'Thay đổi phòng làm việc thành công'
                              },
                            });
                          },
                          () => {
                            console.error('error call api');
                          }
                        );
                    } else {
                      this.dialog.open(NotifyDialogComponent, {
                        width: '350px',
                        disableClose: true,
                        autoFocus: false,
                        data: {
                          title: 'Lỗi',
                          content: 'Bạn không thể đổi phòng làm việc khi có bệnh nhân đang chờ'
                        },
                      });
                    }
                  },
                  () => {
                    console.error('error call api');
                  }
                );
            }
          });
        },
        () => {
          console.error('error call api');
        }
      );
  }
}