import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ReceivePatientService } from 'src/app/core/service/receive-patient.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, convertDateToNormal, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';
import * as moment from 'moment';
import { WebsocketService } from 'src/app/core/service/websocket.service';
import { CommonService } from 'src/app/core/service/common.service';
import { ActivatedRoute } from '@angular/router';

const phoneValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  let phone = formGroup.get('phone').value;
  if (!phone) {
    return {
      phoneError: true
    };
  } else {
    phone = phone.trim();
  }
  if (phone.length !== 10 || !(/^\d+$/.test(phone))) {
    return {
      phoneError: true
    };
  } else {
    return null;
  }
};

declare var $: any;

@Component({
  selector: 'app-receive-patient',
  templateUrl: './receive-patient.component.html',
  styleUrls: ['./receive-patient.component.scss', '../share-style.scss']
})
export class ReceivePatientComponent implements OnInit {
  isEditReceive = false;
  receiveForm: FormGroup;
  autoByPatientCode = [];
  autoByName = [];
  autoByPhone = [];
  autoAddress = [];
  time = new Date();
  doctorList = [];
  roomList = [];

  receiveList = [];
  tableBottomLength = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];

  idReceiveForEdit = null;
  isListenUpdateOrdinal = true;
  isLoading = false;

  today = moment(new Date());
  timer: any;

  patientIdFromListScreen = null;

  constructor(
    private titleService: Title,
    private sideMenuService: SideMenuService,
    private receivePatientService: ReceivePatientService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private websocketService: WebsocketService,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      this.patientIdFromListScreen = params.patientId;
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Tiếp đón bệnh nhân');
    this.sideMenuService.changeItem(1.2);
    this.receiveForm = this.formBuilder.group({
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      debt: ['0'],
      clinicalExamPrice: ['0'],
      roomId: ['', [Validators.required]],
      doctorId: ['', [Validators.required]],
      ordinalNumber: [''],
      examinationReason: ['']
    }, { validator: phoneValidator });

    this.receiveForm.get('patientCode').disable();
    this.receiveForm.get('debt').disable();
    this.receiveForm.get('clinicalExamPrice').disable();
    this.receiveForm.get('ordinalNumber').disable();

    setInterval(() => {
      if (!this.isEditReceive) {
        this.time = new Date();
      }
    }, 1000);
    this.getClinicalExaminationPrice();
    this.getDoctorList();
    this.getRoomList();
    this.getListReceive(this.pageSize, this.pageIndex);
    this.listenWebsocket();
    if (this.patientIdFromListScreen != null) {
      this.initPatient(this.patientIdFromListScreen);
    }
  }

  initPatient(id: any) {
    this.receivePatientService.getById(id)
      .subscribe(
        (data: any) => {
          if (data.message.id != null) {
            this.autoSelected(data.message);
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
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

  onPhoneInput() {
    if (this.receiveForm.hasError('phoneError')) {
      this.receiveForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.receiveForm.get('phone').setErrors(null);
    }
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

  listenWebsocket() {
    this.websocketService.onWsMessageReceivePatient.subscribe((data: any) => {
      for (let i = 0; i < this.receiveList.length; i++) {
        if (this.receiveList[i].id === data.id) {
          this.receiveList[i] = data;
          return;
        }
      }
      if (this.pageIndex === 0) {
        this.getListReceive(this.pageSize, this.pageIndex);
      }
    });

    this.websocketService.onWsMessageRoomService.subscribe((data: any) => {
      for (let i = 0; i < this.roomList.length; i++) {
        if (this.roomList[i].id === data.id) {
          this.roomList[i] = data;
          return;
        }
      }
      this.roomList.push(data);
    });

    this.websocketService.onWsMessageOrdinalNumber.subscribe((data: any) => {
      if (this.isListenUpdateOrdinal) {
        if (data.roomService.id === this.receiveForm.get('roomId').value) {
          this.getOrdinalNumber();
        }
      }
    });
  }

  totalReceive() {
    let totalReceive = 0;
    for (const r of this.roomList) {
      totalReceive = totalReceive + r.totalReceive;
    }
    return totalReceive;
  }

  totalDone() {
    let totalDone = 0;
    for (const r of this.roomList) {
      totalDone = totalDone + r.totalDone;
    }
    return totalDone;
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

  getClinicalExaminationPrice() {
    this.commonService.getClinicalExamination()
      .subscribe(
        (data: any) => {
          this.receiveForm.patchValue({
            clinicalExamPrice: data.message.price
          });
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  autoSelected(event: any) {
    this.resetInput();
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.receiveForm.patchValue({
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone,
      debt: event.debt
    });
    this.receivePatientService.checkReceive(event.patientCode, null)
      .subscribe(
        (data: any) => {
          if (data.message.id) {
            const dialogRef = this.openConfirmDialog(
              'Thông báo',
              'Bệnh nhân này đã được tiếp đón trong ngày hôm nay và chưa kết thúc quá trình khám, bạn có muốn sửa thông tin tiếp đón?'
            );
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.idReceiveForEdit = data.message.id;
                this.isEditReceive = true;
                this.autoByName = [];
                this.autoByPatientCode = [];
                this.autoByPhone = [];
                this.receiveForm.patchValue({
                  patientName: data.message.patient.patientName,
                  patientCode: data.message.patient.patientCode,
                  dateOfBirth: moment(new Date(data.message.patient.dateOfBirth)),
                  gender: data.message.patient.gender.toString(),
                  address: data.message.patient.address,
                  phone: data.message.patient.phone,
                  debt: data.message.patient.debt,
                  roomId: data.message.roomService.id,
                  doctorId: data.message.staff.id,
                  ordinalNumber: data.message.ordinalNumber.ordinalNumber,
                  examinationReason: data.message.examinationReason
                });
                this.receiveForm.get('patientCode').disable();
                this.isListenUpdateOrdinal = false;
              } else {
                this.resetInput();
              }
            });
          }
        },
        () => {
          console.error('search auto failed');
        }
      );
  }

  generateAutoPatientByName(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }

      if (this.receiveForm.get('patientName').value.length === 0) {
        return;
      }
      this.commonService.searchByName(removeSignAndLowerCase(this.receiveForm.get('patientName').value))
        .subscribe(
          (data: any) => {
            this.autoByName = data.message;
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  generateAutoPatientByPatientCode(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }

      if (this.receiveForm.get('patientCode').value.length === 0) {
        return;
      }
      this.commonService.searchByPatientCode(this.receiveForm.get('patientCode').value.toUpperCase())
        .subscribe(
          (data: any) => {
            this.autoByPatientCode = data.message;
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  generateAutoPatientByPhone(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }
      if (this.receiveForm.get('phone').value.length === 0) {
        return;
      }
      this.commonService.searchByPhone(this.receiveForm.get('phone').value)
        .subscribe(
          (data: any) => {
            this.autoByPhone = data.message;
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  generateAutoAddress(event: any): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const keyCode = event.keyCode;
      if (keyCode === 40 || keyCode === 38 || keyCode === 13 || keyCode === 27) {
        return;
      }
      const value = this.receiveForm.get('address').value.trim();
      if (value === 0) {
        return;
      }
      this.commonService.searchByAddress(value)
        .subscribe(
          (data: any) => {
            this.autoAddress = data.message;
            this.autoAddress = [];
            for (const d of data.message) {
              const resultHighlight = buildHighlightString(value, d);
              this.autoAddress.push({
                value: d,
                valueDisplay: resultHighlight
              });
            }
          },
          () => {
            console.error('search auto failed');
          }
        );
    }, 300);
  }

  resetInput() {
    this.isEditReceive = false;
    this.autoByName = [];
    this.autoByPatientCode = [];
    this.autoByPhone = [];
    const clinicalExamPrice = this.receiveForm.get('clinicalExamPrice').value;
    this.receiveForm.reset();
    this.receiveForm.patchValue({
      patientName: '',
      patientCode: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      phone: '',
      debt: '0',
      clinicalExamPrice,
      roomId: '',
      doctorId: '',
      ordinalNumber: '',
      examinationReason: ''
    });
    Object.keys(this.receiveForm.controls).forEach(key => {
      this.receiveForm.get(key).setErrors(null);
    });
    this.receiveForm.get('patientCode').disable();
    this.isListenUpdateOrdinal = true;
  }

  doubleClick() {
    this.resetInput();
    this.receiveForm.get('patientCode').enable();
    this.isEditReceive = false;
  }

  onBlurPatientCode() {
    setTimeout(() => {
      this.commonService.findByPatientCode(this.receiveForm.get('patientCode').value.toUpperCase())
        .subscribe(
          (res: any) => {
            if (res.message.id === null) {
              this.resetInput();
            } else {
              this.receivePatientService.checkReceive(this.receiveForm.get('patientCode').value.toUpperCase(), null)
                .subscribe(
                  (data: any) => {
                    if (data.message.id) {
                      const dialogRef = this.openConfirmDialog(
                        'Thông báo',
                        'Bệnh nhân này đã được tiếp đón trong ngày hôm nay và chưa kết thúc quá trình khám, bạn có muốn sửa thông tin tiếp đón?'
                      );
                      dialogRef.afterClosed().subscribe(result => {
                        if (result) {
                          this.idReceiveForEdit = data.message.id;
                          this.isEditReceive = true;
                          this.autoByName = [];
                          this.autoByPatientCode = [];
                          this.autoByPhone = [];
                          this.receiveForm.patchValue({
                            patientName: data.message.patient.patientName,
                            patientCode: data.message.patient.patientCode,
                            dateOfBirth: moment(new Date(data.message.patient.dateOfBirth)),
                            gender: data.message.patient.gender.toString(),
                            address: data.message.patient.address,
                            phone: data.message.patient.phone,
                            debt: data.message.patient.debt,
                            roomId: data.message.roomService.id,
                            doctorId: data.message.staff.id,
                            ordinalNumber: data.message.ordinalNumber.ordinalNumber,
                            examinationReason: data.message.examinationReason
                          });
                          this.receiveForm.get('patientCode').disable();
                          this.isListenUpdateOrdinal = false;
                        } else {
                          this.resetInput();
                        }
                      });
                    } else {
                      const date = moment(new Date(res.message.dateOfBirth));
                      res.message = propValToString(res.message);
                      this.receiveForm.patchValue({
                        patientName: res.message.patientName,
                        patientCode: res.message.patientCode,
                        dateOfBirth: date,
                        gender: res.message.gender,
                        address: res.message.address,
                        phone: res.message.phone,
                        debt: res.message.debt
                      });
                    }
                  },
                  () => {
                    console.error('search auto failed');
                  }
                );
            }
          },
          () => {
            console.error('call api failed');
          }
        );
    }, 100);
  }

  roomChange(event: any) {
    const id = event.value;
    for (const r of this.roomList) {
      if (r.id === id) {
        this.receiveForm.patchValue({
          doctorId: r.staffIdList[0]
        });
        break;
      }
    }
    this.getOrdinalNumber();
  }

  doctorChange(event: any) {
    const id = event.value;
    for (const d of this.doctorList) {
      if (d.id === id) {
        this.receiveForm.patchValue({
          roomId: d.roomServicesId[0]
        });
        break;
      }
    }
    this.getOrdinalNumber();
  }

  getOrdinalNumber() {
    this.receivePatientService.getOrdinalNumber(this.receiveForm.get('roomId').value)
      .subscribe(
        (data: any) => {
          this.receiveForm.patchValue({
            ordinalNumber: data.message
          });
        },
        () => {
          console.error('call api failed');
        }
      );
  }

  // convert dateTime object to dd/MM/yyyy
  convertDateToNormal(d: any): string {
    if (!d) {
      return d;
    }
    const date = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return date + '/' + month + '/' + year;
  }

  save() {
    const patientCode = this.receiveForm.get('patientCode').value.trim();
    const patientName = this.receiveForm.get('patientName').value.trim();
    const phone = this.receiveForm.get('phone').value.trim();
    const dateOfBirth = convertDateToNormal(this.receiveForm.get('dateOfBirth').value);
    const gender = this.receiveForm.get('gender').value;
    const address = this.receiveForm.get('address').value.trim();

    const ordinalNumber = this.receiveForm.get('ordinalNumber').value;
    const clinicalExamPrice = this.receiveForm.get('clinicalExamPrice').value;
    const roomServiceId = this.receiveForm.get('roomId').value;
    const staffId = this.receiveForm.get('doctorId').value;
    const debt = this.receiveForm.get('debt').value;
    const examinationReason = this.receiveForm.get('examinationReason').value.trim();

    if (ordinalNumber === '') {
      this.openNotifyDialog('Lỗi', 'Lưu tiếp đón không thành công, vui lòng thử lại');
      return;
    }

    if (patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }

    if (phone.length !== 10 || !(/^\d+$/.test(phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }

    if (dateOfBirth === '') {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không được để trống');
      return;
    }

    if (gender === '') {
      this.openNotifyDialog('Lỗi', 'Giới tính không được để trống');
      return;
    }

    if (address === '') {
      this.openNotifyDialog('Lỗi', 'Địa chỉ không được để trống');
      return;
    }

    if (staffId === '') {
      this.openNotifyDialog('Lỗi', 'Vui lòng chọn bác sĩ khám lâm sàng');
      return;
    }

    if (roomServiceId === '') {
      this.openNotifyDialog('Lỗi', 'Vui lòng chọn phòng khám lâm sàng');
      return;
    }

    if (this.isEditReceive) {
      const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có cập nhật thông tin tiếp đón này?');

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.receivePatientService.updateReceivePatient(this.idReceiveForEdit, patientCode, patientName,
            phone, dateOfBirth, gender, address, ordinalNumber, clinicalExamPrice, roomServiceId, staffId, debt, examinationReason)
            .subscribe(
              (data: any) => {
                this.openNotifyDialog('Thông báo', 'Sửa thông tin tiếp đón thành công');
                this.isEditReceive = true;
              },
              () => {
                this.openNotifyDialog('Lỗi', 'Lỗi khi cập nhật thông tin tiếp đón');
              }
            );
        }
      });
    } else {
      const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn lưu thông tin tiếp đón này?');

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.isListenUpdateOrdinal = false;
          this.receivePatientService.receivePatient(patientCode, patientName, phone, dateOfBirth, gender, address,
            ordinalNumber, clinicalExamPrice, roomServiceId, staffId, debt, examinationReason)
            .subscribe(
              (data: any) => {
                if (data.message.patient.patientCode) {
                  this.idReceiveForEdit = data.message.id;
                  this.isEditReceive = true;
                  this.receiveForm.patchValue({
                    patientCode: data.message.patient.patientCode,
                    ordinalNumber: data.message.ordinalNumber.ordinalNumber
                  });
                  this.getListReceive(this.pageSize, this.pageIndex);
                  this.openNotifyDialog('Thông báo', 'Thêm bệnh nhân vào danh sách tiếp đón thành công');
                }
              },
              () => {
                this.openNotifyDialog('Lỗi', 'Lỗi khi thêm bệnh nhân vào danh sách tiếp đón');
              }
            );
        }
      });
    }
  }

  onPageEvent(event: any) {
    this.getListReceive(event.pageSize, event.pageIndex);
  }

  getListReceive(pageSize: number, pageIndex: number) {
    this.isLoading = true;
    this.receivePatientService.getPatientReceive(pageSize, pageIndex)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          this.tableBottomLength = data.message.totalRecord;
          this.pageSize = data.message.pageSize;
          this.pageIndex = data.message.pageIndex;
          this.receiveList = data.message.listData;
        },
        () => {
          this.isLoading = false;
          this.openNotifyDialog('Lỗi', 'Lỗi khi tải danh sách tiếp đón');
        }
      );
  }

  cancelReceive(receive: any) {
    const dialogRef = this.openConfirmDialog('Thông báo', 'Bạn có muốn hủy việc tiếp đón bệnh nhân này?');

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (receive.id === this.idReceiveForEdit) {
          this.resetInput();
        }
        this.receivePatientService.cancelReceive(receive.id)
          .subscribe(
            () => {
              this.openNotifyDialog('Thông báo', 'Hủy tiếp đón thành công');
              receive.status = 0;
            },
            () => {
              this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
            }
          );
      }
    });
  }

  editInfo(e: any) {
    const top = document.getElementById('top');
    top.scrollIntoView();
    this.idReceiveForEdit = e.id;
    this.isEditReceive = true;
    this.autoByName = [];
    this.autoByPatientCode = [];
    this.autoByPhone = [];
    this.time = new Date(e.createdAt);
    this.receiveForm.patchValue({
      patientName: e.patient.patientName,
      patientCode: e.patient.patientCode,
      dateOfBirth: moment(new Date(e.patient.dateOfBirth)),
      gender: e.patient.gender.toString(),
      address: e.patient.address,
      phone: e.patient.phone,
      debt: e.patient.debt,
      roomId: e.roomService.id,
      doctorId: e.staff.id,
      ordinalNumber: e.ordinalNumber.ordinalNumber,
      examinationReason: e.examinationReason
    });
    this.receiveForm.get('patientCode').disable();
    this.isListenUpdateOrdinal = false;
  }

  onDobChange() {
    const dob = this.receiveForm.get('dateOfBirth').value;
    if (dob === null) {
      this.receiveForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(dob) && !dob._isAMomentObject) {
      this.receiveForm.patchValue({
        dateOfBirth: this.today
      });
      return;
    }
    if (dob.isAfter(this.today)) {
      this.receiveForm.patchValue({
        dateOfBirth: this.today
      });
    }
  }

  print() {
    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          for (const printT of data.message) {
            if (printT.printCode === 'ORDINAL') {
              this.commonService.getOnePrintTemplate(printT.id)
                .subscribe(
                  (data2: any) => {
                    const printTemplateHtml = data2.message.templateHTML;
                    const roomServiceId = this.receiveForm.get('roomId').value;
                    const roomName = this.roomList.find(x => x.id === roomServiceId).roomName;
                    const staffId = this.receiveForm.get('doctorId').value;
                    const staffName = this.doctorList.find(x => x.id === staffId).fullName;
                    const objPrint = {
                      ordinalNumber: this.receiveForm.get('ordinalNumber').value,
                      date: this.datePipe.transform(this.time, 'dd/MM/yyyy HH:mm'),
                      roomName,
                      staffName,
                      patientCode: this.receiveForm.get('patientCode').value,
                      patientName: this.receiveForm.get('patientName').value,
                      phone: this.receiveForm.get('phone').value
                    };
                    this.processDataPrint(objPrint, printTemplateHtml);
                  },
                  () => {
                    this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
                  }
                );
              break;
            }
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lỗi máy chủ gặp sự cố, vui lòng thử lại');
        }
      );
  }

  processDataPrint(objectPrint: any, htmlTemplate: string) {
    const printDoc = document.implementation.createHTMLDocument('no-title');
    const wrapper = printDoc.createElement('div');
    wrapper.style.padding = '10px';
    printDoc.body.appendChild(wrapper);
    wrapper.innerHTML = htmlTemplate;

    const keySet = Object.keys(objectPrint);
    for (const key of keySet) {
      const ele = printDoc.getElementById(key);
      if (ele !== null) {
        ele.innerHTML = objectPrint[key];
      }
    }

    $(wrapper).printThis({ importCSS: false });
  }
}
