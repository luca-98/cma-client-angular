import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { RoomService } from 'src/app/core/service/room.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { TemplateReportService } from 'src/app/core/service/template-report.service';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-add-group-service',
  templateUrl: './add-group-service.component.html',
  styleUrls: ['./add-group-service.component.scss']
})
export class AddGroupServiceComponent implements OnInit {


  isAdd = true;
  listStaff = [];
  dataPost = {
    groupServiceId: null,
    groupServiceName: '',
    lststaff: [
    ]
  };

  constructor(
    private groupService: GroupServiceService,
    private dialog: MatDialog,
    private staffService: StaffService,
    public dialogRef: MatDialogRef<AddGroupServiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data) {
      this.isAdd = false;
      this.dataPost.groupServiceId = data.id;
      this.dataPost.groupServiceName = data.groupServiceName;

    }
  }

  ngOnInit(): void {
    this.getAllStaff();
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

  save() {
    this.dataPost.groupServiceName = this.dataPost.groupServiceName.trim();
    if (this.dataPost.groupServiceName === '') {
      this.openNotifyDialog('Lỗi', 'Tên nhóm dịch vụ không được để trống.');
      return;
    }

    this.dataPost.lststaff = [];
    for (const iterator of this.listStaff) {
      if (iterator.checked) {
        this.dataPost.lststaff.push(iterator.id);
      }
    }

    if (this.isAdd) {
      this.groupService.addNewGroupService(this.dataPost).subscribe(
        (res: any) => {
          if (res.message) {
            this.openNotifyDialog('Thông báo', 'Thêm nhóm dịch vụ mới thành công.');
            this.dialogRef.close();
          } else {
            this.openNotifyDialog('Lỗi', 'Tên nhóm dịch vụ đã có trong hệ thống. Vui lòng thử lại');
          }
        }, err => {
          this.openNotifyDialog('Lỗi', 'Thêm nhóm dịch vụ mới thất bại.');
        }
      );
    } else {
      this.groupService.editNewGroupService(this.dataPost).subscribe(
        (res: any) => {
          if (res.message) {
            this.openNotifyDialog('Thông báo', 'Cập nhật nhóm dịch vụ thành công.');
            this.dialogRef.close();
          } else {
            this.openNotifyDialog('Lỗi', 'Cập nhật nhóm dịch vụ thất bại.');
          }
        }, err => {
          this.openNotifyDialog('Lỗi', 'Cập nhật nhóm dịch vụ thất bại.');
        }
      );
    }
  }


  getDetailGroupService(groupServiceId) {
    this.groupService.getDetailGroupService(groupServiceId).subscribe(
      (data: any) => {
        if (data.message) {
          this.dataPost.lststaff = data.message.staffId;
          for (const i of this.dataPost.lststaff) {
            const index = this.listStaff.findIndex(e => e.id === i.id);
            if (index !== -1) {
              this.listStaff[index].checked = true;
            }
          }
        }
      }, err => {
        this.openNotifyDialog('Lỗi', 'Lấy thông tin thất bại.');
      }
    );
  }


  getAllStaff() {
    this.staffService.getAllStaff().subscribe(
      (res: any) => {
        if (res.message) {
          this.listStaff = res.message;
          for (const iterator of this.listStaff) {
            iterator.checked = false;
          }
          if (!this.isAdd) {
            this.getDetailGroupService(this.dataPost.groupServiceId);
          }
        }
      }, (error) => {
        this.openNotifyDialog('Lỗi', 'Lấy danh sách bác sĩ thất bại.');
      }
    );
  }
}
