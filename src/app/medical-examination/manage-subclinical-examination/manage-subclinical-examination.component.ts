import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { ManageClinicalExamService } from 'src/app/core/service/manage-clinical-exam.service';
import { RoomService } from 'src/app/core/service/room.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { StaffService } from 'src/app/core/service/staff.service';
import { SubclinicalService } from 'src/app/core/service/subclinical.service';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

@Component({
  selector: 'app-manage-subclinical-examination',
  templateUrl: './manage-subclinical-examination.component.html',
  styleUrls: ['./manage-subclinical-examination.component.scss']
})
export class ManageSubclinicalExaminationComponent implements OnInit {

  searchForm: FormGroup;
  groupServiceCode = [];
  doctorList = [];
  roomList = [];
  subclinicalExamList = [];

  totalRecord = 0;
  pageIndex = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  today = moment(new Date());
  isLoading = false;

  autoExamCode = [];
  autoPatientCode = [];
  autoPhone = [];
  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private credentialsService: CredentialsService,
    private manageClinicalExamService: ManageClinicalExamService,
    private router: Router,
    private staffService: StaffService,
    private roomService: RoomService,
    private subclinicalService: SubclinicalService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Quản lý phiếu khám cận lâm sàng');
    this.sideMenuService.changeItem(1.6);
    this.searchForm = this.formBuilder.group({
      fromDate: [moment(new Date())],
      toDate: [moment(new Date())],
      roomId: [this.credentialsService.credentials.roomId],
      doctorId: [this.credentialsService.credentials.staffId],
      status: ['-1'],
      clinicalExamCode: [''],
      patientCode: [''],
      phone: ['']
    });

    this.getGroupService();
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  search() {
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  resetInput() {
    this.autoExamCode = [];
    this.autoPatientCode = [];
    this.autoPhone = [];
    this.searchForm.patchValue({
      fromDate: moment(new Date()),
      toDate: moment(new Date()),
      roomId: this.credentialsService.credentials.roomId,
      doctorId: this.credentialsService.credentials.staffId,
      status: '-1',
      clinicalExamCode: '',
      patientCode: '',
      phone: ''
    });
    this.totalRecord = 0;
    this.pageIndex = 0;
    this.pageSize = 25;
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  onPageEvent(event: any) {
    this.getSubclinicalExamList(event.pageSize, event.pageIndex);
  }

  getSubclinicalExamList(pageSize: number, pageIndex: number) {
    this.isLoading = true;
    const fromDate = convertDateToNormal(this.searchForm.get('fromDate').value);
    const toDate = convertDateToNormal(this.searchForm.get('toDate').value);
    const roomId = this.searchForm.get('roomId').value;
    const doctorId = this.searchForm.get('doctorId').value;
    const status = this.searchForm.get('status').value;
    const clinicalExamCode = this.searchForm.get('clinicalExamCode').value;
    const patientCode = this.searchForm.get('patientCode').value;
    const phone = this.searchForm.get('phone').value;

    this.subclinicalService.getListForManage(fromDate, toDate, roomId,
      doctorId, status, clinicalExamCode, patientCode, phone, pageIndex, pageSize)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.pageIndex = data.message.pageIndex;
          this.pageSize = data.message.pageSize;
          this.totalRecord = data.message.totalRecord;
          this.subclinicalExamList = data.message.listData;
        },
        () => {
          this.isLoading = false;
          console.error('error call api');
        }
      );
  }

  getGroupService() {
    this.commonService.getCurrentGroupService()
      .subscribe(
        (data: any) => {
          this.groupServiceCode = data.message;
          this.getDoctorList();
          this.getRoomList();
        },
        () => {
          console.error('error call api');
        }
      );
  }

  getDoctorList() {
    for (const code of this.groupServiceCode) {
      if (code === 'CLINICAL_EXAMINATION') {
        continue;
      }
      this.staffService.getDoctorByGroupServiceCode(code)
        .subscribe(
          (data: any) => {
            for (const staff of data.message) {
              const index = this.doctorList.findIndex(x => x.id === staff.id);
              if (index === -1) {
                this.doctorList.push(staff);
              }
            }
          },
          () => {
            console.error('error call api');
          }
        );
    }
  }

  getRoomList() {
    for (const code of this.groupServiceCode) {
      if (code === 'CLINICAL_EXAMINATION') {
        continue;
      }
      this.roomService.getRoomByGroupServiceCode(code)
        .subscribe(
          (data: any) => {
            for (const room of data.message) {
              const index = this.roomList.findIndex(x => x.id === room.id);
              if (index === -1) {
                this.roomList.push(room);
              }
            }
          },
          () => {
            console.error('error call api');
          }
        );
    }
  }

  roomChange(event: any) {
    const id = event.value;
    for (const r of this.roomList) {
      if (r.id === id) {
        this.searchForm.patchValue({
          doctorId: r.staffIdList[0]
        });
        break;
      }
    }
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  doctorChange(event: any) {
    const id = event.value;
    for (const d of this.doctorList) {
      if (d.id === id) {
        this.searchForm.patchValue({
          roomId: d.roomServicesId[0]
        });
        break;
      }
    }
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  statusChange() {
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  onFromDateChange() {
    if (this.searchForm.get('fromDate').value.isAfter(this.today)) {
      this.searchForm.patchValue({
        fromDate: this.today
      });
    }
    if (this.searchForm.get('fromDate').value.isAfter(this.searchForm.get('toDate').value)) {
      this.searchForm.patchValue({
        fromDate: this.searchForm.get('toDate').value
      });
    }
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  onToDateChange() {
    if (this.searchForm.get('toDate').value.isAfter(this.today)) {
      this.searchForm.patchValue({
        toDate: this.today
      });
    }
    if (this.searchForm.get('fromDate').value.isAfter(this.searchForm.get('toDate').value)) {
      this.searchForm.patchValue({
        toDate: this.searchForm.get('fromDate').value
      });
    }
    this.getSubclinicalExamList(this.pageSize, this.pageIndex);
  }

  async generateAutoExamCode(event: any) {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchForm.get('clinicalExamCode').value.trim().toUpperCase();
    if (value.length === 0) {
      return;
    }
    await this.commonService.searchByMedicalExamCode(value)
      .toPromise()
      .then(
        (data: any) => {
          this.autoExamCode = [];
          for (const d of data.message) {
            const resultHighlight = buildHighlightString(value, d.medicalExaminationCode);
            this.autoExamCode.push({
              value: d.medicalExaminationCode,
              valueDisplay: resultHighlight
            });
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  async generateAutoPatientCode(event: any) {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchForm.get('patientCode').value.trim().toUpperCase();
    if (value.length === 0) {
      return;
    }
    await this.commonService.searchByPatientCode(value)
      .toPromise()
      .then(
        (data: any) => {
          this.autoPatientCode = [];
          for (const d of data.message) {
            const resultHighlight = buildHighlightString(value, d.patientCode);
            this.autoPatientCode.push({
              value: d.patientCode,
              valueDisplay: resultHighlight
            });
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  async generateAutoPhone(event: any) {
    const keyCode = event.keyCode;
    if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
      return;
    }
    const value = this.searchForm.get('phone').value.trim();
    if (value.length === 0) {
      return;
    }
    await this.commonService.searchByPhone(value)
      .toPromise()
      .then(
        (data: any) => {
          this.autoPhone = [];
          for (const d of data.message) {
            const resultHighlight = buildHighlightString(value, d.phone);
            this.autoPhone.push({
              value: d.phone,
              valueDisplay: resultHighlight
            });
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  moveToSubClinicalExam(medicalExamId: any) {
    this.router.navigate(['/medical-examination/subclinical-examination'], { queryParams: { medicalExamId } });
  }


}
