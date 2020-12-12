import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/service/common.service';
import { CredentialsService } from 'src/app/core/service/credentials.service';
import { GroupMedicineService } from 'src/app/core/service/group-medicine.service';
import { MedicalExaminationService } from 'src/app/core/service/medical-examination.service';
import { MedicineService } from 'src/app/core/service/medicine.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { SideMenuService } from 'src/app/core/service/side-menu.service';
import { WebsocketService } from 'src/app/core/service/websocket.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { NotifyDialogComponent } from 'src/app/shared/dialogs/notify-dialog/notify-dialog.component';
import { buildHighlightString, propValToString, removeSignAndLowerCase } from 'src/app/shared/share-func';

declare var $: any;

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.scss']
})

export class PrescriptionsComponent implements OnInit {
  patientForm: FormGroup;
  time = new Date();
  today = moment(new Date());
  timer;
  patientCode: any;
  medicalExamId: any;
  prescriptionId: any;
  listGroupMedicine = [];
  listMedicine = [];
  searchMedicineName = '';
  selectedGroupMedicine = '0';
  listUserMedicine = [];
  medicalExaminationCode = null;
  staffName = null;

  constructor(
    private titleService: Title,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private groupMedicineService: GroupMedicineService,
    private medicineService: MedicineService,
    private sideMenuService: SideMenuService,
    private medicalExaminationService: MedicalExaminationService,
    private menuService: MenuService,
    private credentialsService: CredentialsService,
  ) {
    this.menuService.reloadMenu.subscribe(() => {
      const listPermission = activatedRoute.snapshot.data.permissionCode;
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
    this.sideMenuService.changeItem(1.3);
    this.titleService.setTitle('Kê đơn thuốc');
    this.patientForm = this.formBuilder.group({
      id: [''],
      note: [''],
      patientName: ['', [Validators.required]],
      patientCode: [''],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
    }, { validator: this.phoneValidator });
    this.patientForm.disable();
    this.patientForm.get('note').enable();
    this.activatedRoute.queryParams.subscribe(params => {
      this.patientCode = params.patientCode;
      this.medicalExamId = params.medicalExamId;
      this.getMedicalExam(this.medicalExamId);
    });
    this.getListGroupMedicine();
    this.findAllMedicine();
    this.getPrescriptionByMedicalexamId(this.medicalExamId);
  }

  getMedicalExam(id: any) {
    this.medicalExaminationService.getMedicalExam(id)
      .subscribe(
        (data: any) => {
          this.medicalExaminationCode = data.message.medicalExaminationCode;
          this.staffName = data.message.staff.fullName;
        },
        () => {
          console.log('get data error');
        }
      );
  }

  getPatientInfo(patientCode) {
    if (patientCode) {
      this.commonService.findByPatientCode(patientCode)
        .subscribe(
          (data: any) => {
            if (data.message.length !== 0) {
              this.autoSelected(data.message);
            }
          },
          () => {
          }
        );
    }
  }

  back() {
    const url = '/medical-examination/clinical-examination';
    this.router.navigate([url], { queryParams: { medicalExamId: this.medicalExamId } });
  }

  phoneValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
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
    if (this.patientForm.hasError('phoneError')) {
      this.patientForm.get('phone').setErrors([{ incorrect: true }]);
    } else {
      this.patientForm.get('phone').setErrors(null);
    }
  }

  autoSelected(event: any) {
    const date = moment(new Date(event.dateOfBirth));
    event = propValToString(event);
    this.patientForm.patchValue({
      id: event.id ? event.id : '',
      patientName: event.patientName,
      patientCode: event.patientCode,
      dateOfBirth: date,
      gender: event.gender,
      address: event.address,
      phone: event.phone,
    });
  }

  resetInput() {
    this.patientForm.reset();
    this.patientForm.patchValue({
      patientCode: this.patientCode
    });
  }

  getListGroupMedicine() {
    this.groupMedicineService.getAllGroupMedicine()
      .subscribe(
        (data: any) => {
          if (data.message.length !== 0) {
            this.listGroupMedicine = data.message;
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Tải danh sách nhóm thuốc thất bại.');
        }
      );
  }

  initCheckbox() {
    for (const iterator of this.listMedicine) {
      iterator.checked = false;
      iterator.medicineId = iterator.id;
      delete iterator.id;
    }
    if (this.listUserMedicine.length !== 0) {
      for (const iterator of this.listUserMedicine) {
        const index = this.listMedicine.findIndex(e => e.medicineId === iterator.medicineId);
        if (index !== -1) {
          this.listMedicine[index].checked = true;
        }
      }
    }
  }

  getListMedicine(groupId) {
    if (groupId === 0) {
      this.findAllMedicine();
    } else {
      this.medicineService.getAllMedicineByGroupMedicine(groupId)
        .subscribe(
          (data: any) => {
            if (data.message.length !== 0) {
              this.listMedicine = [];
              this.listMedicine = data.message;
              this.initCheckbox();
            }
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Tải danh sách thuốc thất bại.');
          }
        );
    }
  }

  findAllMedicine() {
    clearTimeout(this.timer);
    this.selectedGroupMedicine = '0';
    this.timer = setTimeout(() => {
      this.medicineService.searchMedicineByName(this.searchMedicineName)
        .subscribe(
          (data: any) => {
            this.listMedicine = [];
            this.listMedicine = data.message;
            this.initCheckbox();
          },
          () => {
            this.openNotifyDialog('Lỗi', 'Lỗi khi tìm kiếm thuốc.');
          }
        );
    }, 300);
  }

  getPrescriptionByMedicalexamId(medicalExamId) {
    if (medicalExamId) {
      this.medicineService.getPrescriptionByMedicalexamId(medicalExamId)
        .subscribe(
          (data: any) => {
            if (data.message.id) {
              this.prescriptionId = data.message.id;
              this.autoSelected(data.message.medicalExaminationByMedicalExaminationId.patient);
              this.patientForm.patchValue({
                note: data.message.note
              });
              this.listUserMedicine = [];
              for (const iterator of data.message.lstPrescriptionDetailDTO) {
                const dataPush = {
                  id: iterator.id,
                  medicineId: iterator.medicineByMedicineId.id,
                  medicineName: iterator.medicineByMedicineId.medicineName,
                  maxQuantity: iterator.medicineByMedicineId.quantity,
                  unitName: iterator.medicineByMedicineId.unitName,
                  quantity: iterator.quantity,
                  noteDetail: iterator.noteDetail
                };
                this.listUserMedicine.push(dataPush);
              }
            } else {
              this.getPatientInfo(this.patientCode);
            }
          },
          () => {
            this.getPatientInfo(this.patientCode);
          }
        );
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

  deleteMedicine(medicineId, isClickDeleteButton?) {
    const indexListUserMedicine = this.listUserMedicine.findIndex(x => x.medicineId === medicineId);
    const prescriptionDetailId = this.listUserMedicine[indexListUserMedicine].id;
    const hanldeCheckbox = () => {
      if (indexListUserMedicine !== -1) {
        this.listUserMedicine.splice(indexListUserMedicine, 1);
      }
      if (isClickDeleteButton) {
        const index = this.listMedicine.findIndex(x => x.medicineId === medicineId);
        if (index !== -1) {
          this.listMedicine[index].checked = false;
        }
      }
    };
    if (prescriptionDetailId) {
      const dialogRef = this.openConfirmDialog(
        'Thông báo',
        'Thuốc này đã được lưu, bạn có muốn xóa thuốc này khỏi phiếu kê đơn thuốc không?'
      );
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.medicineService.deletePrescription(prescriptionDetailId)
            .subscribe(
              (data: any) => {
                if (data.message) {
                  hanldeCheckbox();
                }
              },
              (error) => {
                console.log(error);
                this.openNotifyDialog('Thông báo', 'Xóa thuốc thất bại.');
              }
            );
        }
        else {
          const index = this.listMedicine.findIndex(x => x.medicineId === medicineId);
          if (index !== -1) {
            this.listMedicine[index].checked = true;
          }
        }
      });
    } else {
      hanldeCheckbox();
    }
  }

  hanldeSelectMedicine({ ...item }, event) {
    if (event.target.childNodes[0].nodeName === 'INPUT') {
      if (!item.checked) {
        item.maxQuantity = item.quantity;
        item.quantity = 1;
        item.noteDetail = '';
        item.id = null;
        this.listUserMedicine.push(item);
        const boxTable = document.querySelector('.box-table .table-content');
        setTimeout(() => {
          boxTable.scrollTop = boxTable.scrollHeight;
        }, 50);
      } else {
        this.deleteMedicine(item.medicineId);
      }
    }

  }

  validateQuantity(item) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (item.quantity < 1) {
        item.quantity = 1;
        this.openNotifyDialog('Thông báo', '"' + item.medicineName + '"' + ' phải được kê tối thiểu là 1 ' + item.unitName + '.');
      }
      // if (item.quantity > item.maxQuantity) {
      //   item.quantity = item.maxQuantity;
      //   this.openNotifyDialog('Thông báo',
      // '"' + item.medicineName + '"' + ' hiện chỉ còn ' + item.maxQuantity + ' ' + item.unitName + ' trong kho thuốc.');
      // }
    }, 500);
  }

  onDobChange() {
    const dob = this.patientForm.get('dateOfBirth').value;
    if (dob === null) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return false;
    }
    const regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    if (!regexDate.test(dob) && !dob._isAMomentObject) {
      this.patientForm.patchValue({
        dateOfBirth: this.today
      });
      return false;
    }
    if (dob.isAfter(this.today)) {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không đúng định dạng hoặc vượt quá ngày hiện tại.');
      return false;
    }
    return true;
  }

  convertDateToNormal(d: any): string {
    if (!d) {
      return d;
    }
    const date = d._d.getDate();
    const month = d._d.getMonth() + 1;
    const year = d._d.getFullYear();
    return date + '/' + month + '/' + year;

  }

  saveData() {
    const patient = {
      id: this.patientForm.get('id').value,
      patientName: this.patientForm.get('patientName').value.trim(),
      dateOfBirth: this.convertDateToNormal(this.patientForm.get('dateOfBirth').value),
      gender: this.patientForm.get('gender').value,
      address: this.patientForm.get('address').value.trim(),
      phone: this.patientForm.get('phone').value.trim(),
      patientCode: this.patientForm.get('patientCode').value.trim(),
      note: this.patientForm.get('note').value.trim(),
    };

    if (patient.patientName === '') {
      this.openNotifyDialog('Lỗi', 'Tên bệnh nhân không được để trống');
      return;
    }
    if (patient.phone.length !== 10 || !(/^\d+$/.test(patient.phone))) {
      this.openNotifyDialog('Lỗi', 'Số điện thoại không đúng');
      return;
    }

    if (patient.dateOfBirth === '') {
      this.openNotifyDialog('Lỗi', 'Ngày sinh không được để trống');
      return;
    }

    if (patient.gender === '') {
      this.openNotifyDialog('Lỗi', 'Giới tính không được để trống');
      return;
    }

    if (patient.address === '') {
      this.openNotifyDialog('Lỗi', 'Địa chỉ không được để trống');
      return;
    }
    if (!this.onDobChange()) {
      return;
    }
    const list = [];
    for (const iterator of this.listUserMedicine) {
      const item = {
        id: iterator.id,
        medicineId: iterator.medicineId,
        quantity: iterator.quantity,
        noteDetail: iterator.noteDetail,
      };
      list.push(item);
    }

    const dataPost = {
      medicalExamId: this.medicalExamId,
      patientId: patient.id,
      prescriptionId: this.prescriptionId ? this.prescriptionId : null,
      patientName: patient.patientName,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      patientCode: patient.patientCode,
      address: patient.address,
      note: patient.note,
      lstMedicineDetail: list
    };
    this.medicineService.updatePrescription(dataPost)
      .subscribe(
        (data: any) => {
          if (data.message) {
            this.openNotifyDialog('Thông báo', 'Lưu thông tin đơn thuốc thành công.');
            this.getPrescriptionByMedicalexamId(this.medicalExamId);
            this.updateHtmlReport(data.message);
          }
        },
        () => {
          this.openNotifyDialog('Lỗi', 'Lưu thông tin đơn thuốc thất bại.');
        }
      );
  }

  updateHtmlReport(id: any) {
    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          for (const printT of data.message) {
            if (printT.printCode === 'PRESCRIPTIONS') {
              this.commonService.getOnePrintTemplate(printT.id)
                .subscribe(
                  (data2: any) => {
                    const htmlTemplate = data2.message.templateHTML;
                    const medicalExaminationCode = this.medicalExaminationCode;
                    const patientCode = this.patientForm.get('patientCode').value.trim();
                    const patientName = this.patientForm.get('patientName').value.trim();
                    const gender = this.patientForm.get('gender').value == 0 ? 'Nam' : 'Nữ';
                    const phone = this.patientForm.get('phone').value.trim();
                    const dateOfBirth = this.datePipe.transform(this.patientForm.get('dateOfBirth').value, 'dd/MM/yyyy');
                    const address = this.patientForm.get('address').value.trim();
                    const note = this.patientForm.get('note').value.trim();
                    const day = this.datePipe.transform(moment(new Date()), 'dd');
                    const month = this.datePipe.transform(moment(new Date()), 'MM');
                    const year = this.datePipe.transform(moment(new Date()), 'yyyy');
                    const staffName = this.staffName;

                    const listTrNode = [];
                    let count = 0;
                    for (const ele of this.listUserMedicine) {
                      const tr = document.createElement('TR');

                      const td1 = document.createElement('TD');
                      td1.style.borderCollapse = 'collapse';
                      td1.style.border = '1px dotted rgb(0, 0, 0)';
                      td1.style.overflowWrap = 'break-word';
                      td1.style.padding = '0px 6px';
                      td1.innerHTML = ++count + '';
                      tr.appendChild(td1);

                      const td2 = document.createElement('TD');
                      td2.style.borderCollapse = 'collapse';
                      td2.style.border = '1px dotted rgb(0, 0, 0)';
                      td2.style.overflowWrap = 'break-word';
                      td2.style.padding = '0px 6px';
                      td2.innerHTML = ele.medicineName;
                      tr.appendChild(td2);

                      const td3 = document.createElement('TD');
                      td3.style.borderCollapse = 'collapse';
                      td3.style.border = '1px dotted rgb(0, 0, 0)';
                      td3.style.overflowWrap = 'break-word';
                      td3.style.padding = '0px 6px';
                      td3.innerHTML = ele.quantity + ' ' + ele.unitName;
                      tr.appendChild(td3);

                      const td4 = document.createElement('TD');
                      td4.style.borderCollapse = 'collapse';
                      td4.style.border = '1px dotted rgb(0, 0, 0)';
                      td4.style.overflowWrap = 'break-word';
                      td4.style.padding = '0px 6px';
                      td4.innerHTML = ele.noteDetail;
                      tr.appendChild(td4);

                      listTrNode.push(tr);
                    }

                    const objPrint = {
                      medicalExaminationCode,
                      patientCode,
                      patientName,
                      gender,
                      phone,
                      dateOfBirth,
                      address,
                      note,
                      day,
                      month,
                      year,
                      staffName,
                      data: listTrNode
                    };

                    const printDoc = document.implementation.createHTMLDocument('no-title');
                    const wrapper = printDoc.createElement('div');
                    wrapper.setAttribute('class', 'editor');
                    printDoc.body.appendChild(wrapper);
                    wrapper.innerHTML = htmlTemplate;

                    const keySet = Object.keys(objPrint);
                    for (const key of keySet) {
                      if (key === 'data') {
                        const tbodyAppoint = printDoc.getElementById('tbody-prescriptions');
                        const dataTemp = printDoc.getElementById('data');
                        for (const tr of objPrint.data) {
                          tbodyAppoint.insertBefore(tr, dataTemp);
                        }
                        dataTemp.remove();
                        continue;
                      }
                      const ele = printDoc.getElementById(key);
                      if (ele !== null) {
                        ele.innerHTML = objPrint[key];
                      }
                    }

                    const htmlReportSave = wrapper.innerHTML;
                    this.medicineService.updatePrintDataHtmlPrescriptions(id, htmlReportSave)
                      .subscribe(
                        () => {
                          console.log('update html report success');
                        },
                        () => {
                          console.log('update html report error');
                        }
                      );
                  },
                  () => {
                    console.log('update html report error');
                  }
                );
              break;
            }
          }
        },
        () => {
          console.log('update html report error');
        }
      );
  }

  print() {
    this.commonService.getListPrintTemplate()
      .subscribe(
        (data: any) => {
          for (const printT of data.message) {
            if (printT.printCode === 'PRESCRIPTIONS') {
              this.commonService.getOnePrintTemplate(printT.id)
                .subscribe(
                  (data2: any) => {
                    const printTemplateHtml = data2.message.templateHTML;
                    const medicalExaminationCode = this.medicalExaminationCode;
                    const patientCode = this.patientForm.get('patientCode').value.trim();
                    const patientName = this.patientForm.get('patientName').value.trim();
                    const gender = this.patientForm.get('gender').value == 0 ? 'Nam' : 'Nữ';
                    const phone = this.patientForm.get('phone').value.trim();
                    const dateOfBirth = this.datePipe.transform(this.patientForm.get('dateOfBirth').value, 'dd/MM/yyyy');
                    const address = this.patientForm.get('address').value.trim();
                    const note = this.patientForm.get('note').value.trim();
                    const day = this.datePipe.transform(moment(new Date()), 'dd');
                    const month = this.datePipe.transform(moment(new Date()), 'MM');
                    const year = this.datePipe.transform(moment(new Date()), 'yyyy');
                    const staffName = this.staffName;

                    const listTrNode = [];
                    let count = 0;
                    for (const ele of this.listUserMedicine) {
                      const tr = document.createElement('TR');

                      const td1 = document.createElement('TD');
                      td1.style.borderCollapse = 'collapse';
                      td1.style.border = '1px dotted rgb(0, 0, 0)';
                      td1.style.overflowWrap = 'break-word';
                      td1.style.padding = '0px 6px';
                      td1.innerHTML = ++count + '';
                      tr.appendChild(td1);

                      const td2 = document.createElement('TD');
                      td2.style.borderCollapse = 'collapse';
                      td2.style.border = '1px dotted rgb(0, 0, 0)';
                      td2.style.overflowWrap = 'break-word';
                      td2.style.padding = '0px 6px';
                      td2.innerHTML = ele.medicineName;
                      tr.appendChild(td2);

                      const td3 = document.createElement('TD');
                      td3.style.borderCollapse = 'collapse';
                      td3.style.border = '1px dotted rgb(0, 0, 0)';
                      td3.style.overflowWrap = 'break-word';
                      td3.style.padding = '0px 6px';
                      td3.innerHTML = ele.quantity + ' ' + ele.unitName;
                      tr.appendChild(td3);

                      const td4 = document.createElement('TD');
                      td4.style.borderCollapse = 'collapse';
                      td4.style.border = '1px dotted rgb(0, 0, 0)';
                      td4.style.overflowWrap = 'break-word';
                      td4.style.padding = '0px 6px';
                      td4.innerHTML = ele.noteDetail;
                      tr.appendChild(td4);

                      listTrNode.push(tr);
                    }


                    const objPrint = {
                      medicalExaminationCode,
                      patientCode,
                      patientName,
                      gender,
                      phone,
                      dateOfBirth,
                      address,
                      note,
                      day,
                      month,
                      year,
                      staffName,
                      data: listTrNode
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
    wrapper.setAttribute('class', 'editor');
    printDoc.body.appendChild(wrapper);
    wrapper.innerHTML = htmlTemplate;

    const keySet = Object.keys(objectPrint);
    for (const key of keySet) {
      if (key === 'data') {
        const tbodyAppoint = printDoc.getElementById('tbody-prescriptions');
        const data = printDoc.getElementById('data');
        for (const tr of objectPrint.data) {
          tbodyAppoint.insertBefore(tr, data);
        }
        data.remove();
        continue;
      }
      const ele = printDoc.getElementById(key);
      if (ele !== null) {
        ele.innerHTML = objectPrint[key];
      }
    }

    $(wrapper).printThis({ importCSS: false });
  }
}
