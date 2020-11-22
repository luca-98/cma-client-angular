import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClinicServiceService } from 'src/app/core/service/clinic-service.service';
import { GroupServiceService } from 'src/app/core/service/group-service.service';
import { RoomService } from 'src/app/core/service/room.service';
import { TemplateReportService } from 'src/app/core/service/template-report.service';
import { NotifyDialogComponent } from '../notify-dialog/notify-dialog.component';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss']
})
export class AddServiceComponent implements OnInit {

  serviceList = [];
  templateReport = [];
  listGroupService = [];
  listRoomService = [];
  isAdd = true;
  dataPost = {
    serviceId: null,
    serviceName: '',
    groupServiceId: null,
    price: 0,
    templateReportservice: null,
    roomServiceId: []
  };

  constructor(
    private templateReportService: TemplateReportService,
    private groupService: GroupServiceService,
    private dialog: MatDialog,
    private roomService: RoomService,
    private clinicService: ClinicServiceService,
    public dialogRef: MatDialogRef<AddServiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data) {
      this.isAdd = false;
      this.dataPost.serviceId = data.serviceId;
      this.dataPost.price = data.price;
      this.dataPost.serviceName = data.serviceName;
      this.dataPost.groupServiceId = data.groupServiceId.id;
      this.dataPost.templateReportservice = data.templateReport.templateReportId;
      this.dataPost.roomServiceId = data.lstRoomServices;
    }
  }

  ngOnInit(): void {
    this.getAllTemplateReport();
    this.getListGroupService();
    this.getListRoomService();
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
    this.dataPost.serviceName = this.dataPost.serviceName.trim();
    if (this.dataPost.serviceName === '') {
      this.openNotifyDialog('Lỗi', 'Tên dịch vụ không được để trống.');
      return;
    }
    if (this.dataPost.price < 0) {
      this.dataPost.price = 0;
      this.openNotifyDialog('Lỗi', 'Giá dịch vụ không được nhỏ hơn 0.');
      return;
    }
    this.dataPost.roomServiceId = [];
    for (const iterator of this.listRoomService) {
      if (iterator.checked) {
        this.dataPost.roomServiceId.push(iterator.id);
      }
    }
    if (this.isAdd) {
      this.clinicService.addNewService(this.dataPost).subscribe(
        (res: any) => {
          if (res.message) {
            this.openNotifyDialog('Thông báo', 'Thêm dịch vụ mới thành công.');
            this.dialogRef.close();
          } else {
            this.openNotifyDialog('Lỗi', 'Thêm dịch vụ mới thất bại.');
          }
        }, err => {
          this.openNotifyDialog('Lỗi', 'Thêm dịch vụ mới thất bại.');
        }
      );
    } else {
      this.clinicService.updateService(this.dataPost).subscribe(
        (res: any) => {
          if (res.message) {
            this.openNotifyDialog('Thông báo', 'Cập nhật dịch vụ thành công.');
            this.dialogRef.close();
          } else {
            this.openNotifyDialog('Lỗi', 'Cập nhật dịch vụ thất bại.');
          }
        }, err => {
          this.openNotifyDialog('Lỗi', 'Cập nhật dịch vụ thất bại.');
        }
      );
    }

  }

  getAllTemplateReport() {
    this.templateReportService.getAllTemplateReport().subscribe(
      (res: any) => {
        if (res.message) {
          if (this.isAdd) {
            this.dataPost.templateReportservice = res.message[0].templateReportId;
          }
          this.templateReport = res.message;
        }
      }, err => {
        this.openNotifyDialog('Lỗi', 'Lấy danh sách mẫu báo cáo thất bại.');
      }
    );
  }

  getListGroupService() {
    this.groupService.getAllGroupService().subscribe(
      (res: any) => {
        if (res.message) {
          if (this.isAdd) {
            this.dataPost.groupServiceId = res.message[0].id;
          }
          this.listGroupService = res.message;
        }
      }, (error) => {
        this.openNotifyDialog('Lỗi', 'Lấy danh sách nhóm dịch vụ thất bại.');
      }
    );
  }

  getListRoomService() {
    this.roomService.getListRoomService().subscribe(
      (res: any) => {
        if (res.message) {
          this.listRoomService = res.message;
          for (const iterator of this.listRoomService) {
            iterator.checked = false;
          }
          if (!this.isAdd) {
            for (const i of this.dataPost.roomServiceId) {
              const index = this.listRoomService.findIndex(e => e.id === i.id);
              if (index !== -1) {
                this.listRoomService[index].checked = true;
              }
            }
          }
        }
      }, (error) => {
        this.openNotifyDialog('Lỗi', 'Lấy danh sách phòng khám thất bại.');
      }
    );

  }

}
