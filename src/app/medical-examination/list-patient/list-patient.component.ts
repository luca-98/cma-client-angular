import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { PatientService } from 'src/app/core/service/patient.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { EditPatientDialogComponent } from 'src/app/shared/dialogs/edit-patient-dialog/edit-patient-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';
import { buildHighlightString } from 'src/app/shared/share-func';

@Component({
  selector: 'app-list-patient',
  templateUrl: './list-patient.component.html',
  styleUrls: ['./list-patient.component.scss', '../share-style.scss']
})
export class ListPatientComponent implements OnInit {
  patientList = [];
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  autoByAddress = [];
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  isLoading = false;
  tableBottomLength = 0;
  searchData = {
    patientNameSearch: '',
    addressSearch: '',
    gender: '',
    patientCode: '',
    phone: '',
    yearOfBirth: ''
  };
  timer;
  progress = 0;

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private patientService: PatientService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Danh sách bệnh nhân');
    this.sideMenuService.changeItem(1.1);
    this.getListPatient();
  }

  reset() {
    this.searchData = {
      patientNameSearch: '',
      addressSearch: '',
      gender: '',
      patientCode: '',
      phone: '',
      yearOfBirth: ''
    };
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

  openEditDialog(patient: any) {
    const patientForm = {
      id: patient.id,
      patientCode: patient.patientCode,
      debt: patient.debt,
      patientName: patient.patientName,
      phone: patient.phone,
      dateOfBirth: moment(new Date(patient.dateOfBirth)),
      gender: patient.gender.toString(),
      address: patient.address
    };
    return this.dialog.open(EditPatientDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: {
        patientForm
      },
    });
  }

  getListPatient() {
    this.isLoading = true;
    this.patientService.getPatient(this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.patientList = data.message.patientEntityList;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
        },
        () => {
          this.isLoading = false;
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách bệnh nhân');
        }
      );
  }

  searchPatient() {
    this.isLoading = true;
    this.patientService.searchPatient(this.searchData, this.pageSize, this.pageIndex)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.patientList = data.message.patientEntityList;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
        },
        () => {
          this.isLoading = false;
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách bệnh nhân');
        }
      );
  }

  onPageEvent(event: any) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.searchPatient();
  }

  deletePatient(patientId: any) {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn xóa bệnh nhân này?');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.deletePatient(patientId)
          .subscribe(
            (data: any) => {
              if (data.message) {
                this.openNotifyDialog('Thông báo', 'Xóa bệnh nhân thành công.');
                this.searchPatient();
              }
              if (!data.message) {
                this.openNotifyDialog('Thông báo', 'Xóa bệnh nhân thất bại, do đang tiếp đón bệnh nhân này.');
              }
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Xóa bệnh nhân thất bại.');
            }
          );
      }
    });
  }

  editPatient(patient: any) {
    const dialogRef = this.openEditDialog(patient);
    dialogRef.afterClosed().subscribe(result => {
      if (typeof (result) === 'undefined') {
        setTimeout(() => {
          this.searchPatient();
        }, 300);
      }
    });
  }

  generateAutoPatientByName(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.patientNameSearch.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.commonService.searchByName(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByName = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientName);
              this.autoByName.push({
                value: d.patientName,
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

  generateAutoPatientByCode(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.patientCode.trim().toUpperCase();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.commonService.searchByPatientCode(value)
        .subscribe(
          (data: any) => {
            this.autoByPatientCode = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.patientCode);
              this.autoByPatientCode.push({
                value: d.patientCode,
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

  generateAutoPatientByPhone(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.phone.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.commonService.searchByPhone(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByPhone = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d.phone);
              this.autoByPhone.push({
                value: d.phone,
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

  generateAutoPatientByAddress(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchData.addressSearch.trim();

    if (value.length === 0) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.commonService.searchByAddress(removeSignAndLowerCase(value))
        .subscribe(
          (data: any) => {
            this.autoByAddress = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d);
              this.autoByAddress.push({
                value: d,
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


  excelInputChange(fileInputEvent: any) {
    const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (excelType === fileInputEvent.target.files[0].type) {
      this.progress = 0;
      const file = fileInputEvent.target.files[0];
      this.patientService.uploadListPatient(file).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(100 * event.loaded / event.total);
            console.log('Process upload :', this.progress);
          } else if (event instanceof HttpResponse) {
            console.log('HttpResponse message', event.body.message);
            if (event.body.message.length !== 0) {
              this.openNotifyDialog('Thông báo', 'Nhập danh sách bệnh nhân thành công.');
            } else {
              this.openNotifyDialog('Lỗi', 'Đã có lỗi xảy ra.');
            }
          }
        },
        err => {
          this.progress = 0;
          this.openNotifyDialog('Lỗi', 'Đã xảy ra lỗi trong quá trình upload file, vui lòng thử lại.');
        });
    } else {
      this.openNotifyDialog('Lỗi', 'Bạn chỉ có thể upload file định dạng excel');
    }

  }

  exportExcel() {
    this.patientService.downloadListPatient().subscribe(
      (data) => {
        this.downloadFile(data, 'Danh sách bệnh nhân.xlsx');
      },
      (err) => {
        this.progress = 0;
        this.openNotifyDialog('Lỗi', 'Đã xảy ra lỗi trong quá trình tải file danh sách bệnh nhân, vui lòng thử lại.');
      }
    );
  }

  downloadTemplate() {
    this.patientService.downloadTemplate().subscribe(
      (data) => {
        this.downloadFile(data, 'Mẫu danh sách bệnh nhân.xlsx');
      },
      (err) => {
        this.openNotifyDialog('Lỗi', 'Đã xảy ra lỗi trong quá trình tải file template, vui lòng thử lại.');
      }
    );
  }

  moveToDetail(patientId: any) {
    this.router.navigate(['/medical-examination/list-patient/detail-infor'], { queryParams: { patientId } });
  }

  downloadFile(data: any, fileName: string) {
    const blob = new Blob([data], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = url;
    anchor.click();
  }
}
