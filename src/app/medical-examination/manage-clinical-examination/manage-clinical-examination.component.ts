import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import * as moment from 'moment';
import { ManageClinicalExamService } from 'src/app/core/service/manage-clinical-exam.service';
import { buildHighlightString, convertDateToNormal } from 'src/app/shared/share-func';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-clinical-examination',
  templateUrl: './manage-clinical-examination.component.html',
  styleUrls: ['./manage-clinical-examination.component.scss', '../share-style.scss']
})
export class ManageClinicalExaminationComponent implements OnInit {

  searchForm: FormGroup;
  doctorList = [];
  roomList = [];
  clinicalExamList = [];
  nextOrdinalNumber = 1;

  totalRecord = 0;
  pageIndex = 0;
  pageSize = 25;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  today = moment(new Date());

  autoExamCode = [];
  autoPatientCode = [];
  autoPhone = [];
  isLoading = false;

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private credentialsService: CredentialsService,
    private manageClinicalExamService: ManageClinicalExamService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Quản lý phiếu khám');
    this.sideMenuService.changeItem(1.4);

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

    this.getDoctorList();
    this.getRoomList();
    this.getClinicalExamList(this.pageSize, this.pageIndex);
    this.getNextOrdinalNumber();
  }

  search() {
    this.getClinicalExamList(this.pageSize, this.pageIndex);
  }

  resetInput() {
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
    this.getClinicalExamList(this.pageSize, this.pageIndex);
    this.getNextOrdinalNumber();
  }

  onPageEvent(event: any) {
    this.getClinicalExamList(event.pageSize, event.pageIndex);
  }

  getNextOrdinalNumber() {
    const doctorId = this.searchForm.get('doctorId').value;
    this.manageClinicalExamService.getNextOrdinNumberStaff(doctorId)
      .subscribe(
        (data: any) => {
          this.nextOrdinalNumber = data.message;
        },
        () => {
          console.error('error call api');
        }
      );
  }

  getClinicalExamList(pageSize: number, pageIndex: number) {
    this.isLoading = true;

    const fromDate = convertDateToNormal(this.searchForm.get('fromDate').value);
    const toDate = convertDateToNormal(this.searchForm.get('toDate').value);
    const roomId = this.searchForm.get('roomId').value;
    const doctorId = this.searchForm.get('doctorId').value;
    const status = this.searchForm.get('status').value;
    const clinicalExamCode = this.searchForm.get('clinicalExamCode').value;
    const patientCode = this.searchForm.get('patientCode').value;
    const phone = this.searchForm.get('phone').value;

    this.manageClinicalExamService.getPatientReceive(fromDate, toDate, roomId,
      doctorId, status, clinicalExamCode, patientCode, phone, pageIndex, pageSize)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.pageIndex = data.message.pageIndex;
          this.pageSize = data.message.pageSize;
          this.totalRecord = data.message.totalRecord;
          this.clinicalExamList = data.message.listData;
        },
        () => {
          this.isLoading = false;
          console.error('error call api');
        }
      );
  }

  getDoctorList() {
    this.commonService.getAllDoctor()
      .subscribe(
        (data: any) => {
          this.doctorList = data.message;
        },
        () => {
          console.error('error call api');
        }
      );
  }

  getRoomList() {
    this.commonService.getRoomMedicalExam()
      .subscribe(
        (data: any) => {
          this.roomList = data.message;
        },
        () => {
          console.error('error call api');
        }
      );
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
    this.getClinicalExamList(this.pageSize, this.pageIndex);
    this.getNextOrdinalNumber();
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
    this.getClinicalExamList(this.pageSize, this.pageIndex);
    this.getNextOrdinalNumber();
  }

  statusChange() {
    this.getClinicalExamList(this.pageSize, this.pageIndex);
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
    this.getClinicalExamList(this.pageSize, this.pageIndex);
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
    this.getClinicalExamList(this.pageSize, this.pageIndex);
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

  moveToClinicalExam(medicalExamId: any) {
    this.router.navigate(['/medical-examination/clinical-examination'], { queryParams: { medicalExamId } });
  }
}
